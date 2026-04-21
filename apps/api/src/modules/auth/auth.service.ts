import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { MailerService } from '../mailer/mailer.service';
import type { JwtPayload } from './strategies/jwt.strategy';
import { randomBytes } from 'crypto';

export interface OAuthProfile {
  email: string;
  firstName: string;
  lastName: string;
}

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60; // 15 minutes

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Register a new user.
   * - Checks for duplicate email
   * - Hashes password with bcrypt (saltRounds=12)
   * - Returns tokens + user data
   */
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await this.usersService.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      passwordHash,
      status: 'ACTIVE',
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Validate credentials and return tokens.
   */
  async login(
    email: string,
    password: string,
    metadata: { userAgent?: string; ipAddress?: string } = {},
  ) {
    const lockoutKey = `lockout:${email.toLowerCase()}`;
    const attempts = await this.redisService.get(lockoutKey);

    if (attempts && parseInt(attempts, 10) >= MAX_LOGIN_ATTEMPTS) {
      throw new ForbiddenException(
        'Account locked due to too many failed attempts. Try again in 15 minutes.',
      );
    }

    const user = await this.usersService.findByEmail(email, {
      includePassword: true,
      includeTwoFactor: true,
    });
    if (!user) {
      await this.incrementLockout(lockoutKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      await this.incrementLockout(lockoutKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Reset lockout on successful login
    await this.redisService.del(lockoutKey);

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Create a new session record
    const refreshTokenHash = await bcrypt.hash(
      tokens.refreshToken,
      SALT_ROUNDS,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.sessionRepo.save(
      this.sessionRepo.create({
        userId: user.id,
        refreshTokenHash,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt,
        lastActiveAt: new Date(),
      }),
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
      tokens,
    };
  }

  private async incrementLockout(key: string) {
    const attempts = await this.redisService.incr(key);
    if (attempts === 1) {
      await this.redisService.expire(key, LOCKOUT_DURATION);
    }
  }

  /**
   * Refresh access token using a valid refresh token.
   * Implements token rotation — issues new refresh token on every use.
   */
  async refresh(refreshToken: string, metadata: { ipAddress?: string } = {}) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Find the session associated with this refresh token
    // We need to check all active sessions for this user
    const sessions = await this.sessionRepo.find({
      where: { userId: payload.sub, isRevoked: false },
      select: ['id', 'refreshTokenHash', 'expiresAt'],
    });

    let currentSession: UserSession | undefined;
    for (const session of sessions) {
      if (await bcrypt.compare(refreshToken, session.refreshTokenHash)) {
        currentSession = session;
        break;
      }
    }

    if (!currentSession) {
      // Token reuse detection: if token is valid but not in our active sessions,
      // it might have been used before. Invalidate ALL sessions for this user.
      await this.sessionRepo.update(
        { userId: payload.sub },
        { isRevoked: true },
      );
      throw new UnauthorizedException(
        'Refresh token reuse detected — all sessions invalidated',
      );
    }

    if (new Date() > currentSession.expiresAt) {
      await this.sessionRepo.update(currentSession.id, { isRevoked: true });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new pair
    const tokens = await this.generateTokens(
      payload.sub,
      payload.email,
      payload.role,
    );

    // Rotate the token in the session
    const newHash = await bcrypt.hash(tokens.refreshToken, SALT_ROUNDS);
    await this.sessionRepo.update(currentSession.id, {
      refreshTokenHash: newHash,
      lastActiveAt: new Date(),
      ipAddress: metadata.ipAddress || currentSession.ipAddress,
    });

    return tokens;
  }

  /**
   * Invalidate refresh token (logout).
   */
  async logout(userId: string, refreshToken: string) {
    const sessions = await this.sessionRepo.find({
      where: { userId, isRevoked: false },
      select: ['id', 'refreshTokenHash'],
    });

    for (const session of sessions) {
      if (await bcrypt.compare(refreshToken, session.refreshTokenHash)) {
        await this.sessionRepo.update(session.id, { isRevoked: true });
        return;
      }
    }
  }

  /**
   * List all active sessions for a user.
   */
  async getSessions(userId: string, currentRefreshToken?: string) {
    const sessions = await this.sessionRepo.find({
      where: { userId, isRevoked: false },
      order: { lastActiveAt: 'DESC' },
      select: [
        'id',
        'userAgent',
        'ipAddress',
        'deviceType',
        'lastActiveAt',
        'expiresAt',
        'refreshTokenHash',
      ],
    });

    const result: any[] = [];
    for (const session of sessions) {
      const isCurrent = currentRefreshToken
        ? await bcrypt.compare(currentRefreshToken, session.refreshTokenHash)
        : false;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { refreshTokenHash, ...sessionData } = session;
      result.push({
        ...sessionData,
        isCurrent,
      });
    }

    return result;
  }

  /**
   * Revoke a specific session.
   */
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, userId, isRevoked: false },
    });

    if (!session) {
      throw new NotFoundException('Session not found or already revoked');
    }

    await this.sessionRepo.update(sessionId, { isRevoked: true });
  }

  /**
   * Initiate forgot password flow.
   */
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return;

    const resetToken = randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, SALT_ROUNDS);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await this.usersService.update(user.id, {
      resetPasswordTokenHash: hash,
      resetPasswordExpires: expires,
    });

    await this.mailerService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Reset password using token.
   */
  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email, {
      includeResetFields: true,
    });

    if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpires) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new UnauthorizedException('Reset token has expired');
    }

    const tokenValid = await bcrypt.compare(token, user.resetPasswordTokenHash);
    if (!tokenValid) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.usersService.update(user.id, {
      passwordHash,
      resetPasswordTokenHash: null,
      resetPasswordExpires: null,
    });
  }

  /**
   * Send a passwordless magic login link.
   */
  async sendMagicLink(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return; // Silent return for security

    const magicLinkToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, purpose: 'magic-link' },
      {
        secret: this.config.get<string>('jwt.magicLinkSecret'),
        expiresIn: this.config.get<string>('jwt.magicLinkExpiry') as any,
      },
    );

    await this.mailerService.sendMagicLinkEmail(user.email, magicLinkToken);
  }

  /**
   * Login using a magic link token.
   */
  async loginWithMagicLink(
    token: string,
    metadata: { userAgent?: string; ipAddress?: string } = {},
  ) {
    let payload: { sub: string; email: string; purpose: string };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('jwt.magicLinkSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    if (payload.purpose !== 'magic-link') {
      throw new UnauthorizedException('Invalid token purpose');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Track session
    const refreshTokenHash = await bcrypt.hash(
      tokens.refreshToken,
      SALT_ROUNDS,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.sessionRepo.save(
      this.sessionRepo.create({
        userId: user.id,
        refreshTokenHash,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt,
        lastActiveAt: new Date(),
      }),
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Validate or create a user from OAuth profile.
   */
  async validateOAuthUser(profile: OAuthProfile) {
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      // Auto-register if user doesn't exist
      user = await this.usersService.create({
        email: profile.email.toLowerCase(),
        firstName: profile.firstName,
        lastName: profile.lastName,
        passwordHash: '', // No password for OAuth users
        status: 'ACTIVE',
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    return user;
  }

  /**
   * Generate 2FA secret and QR code for enrollment.
   */
  async generate2FA(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException();

    const secret = speakeasy.generateSecret({
      name: `Nurox ERP (${user.email})`,
    });

    await this.usersService.update(userId, {
      twoFactorSecret: secret.base32,
    });

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url!);
    return { qrCodeDataURL, secret: secret.base32 };
  }

  /**
   * Verify and enable 2FA.
   */
  async enable2FA(userId: string, token: string) {
    const user = await this.usersService.findById(userId);
    const fullUser = await this.usersService.findByEmail(user!.email, {
      includeTwoFactor: true,
    });

    if (!fullUser?.twoFactorSecret) {
      throw new UnauthorizedException('2FA secret not generated');
    }

    const verified = speakeasy.totp.verify({
      secret: fullUser.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    const backupCodes = Array.from({ length: 10 }, () =>
      randomBytes(4).toString('hex'),
    );
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, SALT_ROUNDS)),
    );

    await this.usersService.update(userId, {
      isTwoFactorEnabled: true,
      twoFactorBackupCodes: JSON.stringify(hashedBackupCodes),
    });

    return { backupCodes };
  }

  /**
   * Verify 2FA token during login.
   */
  async verify2FA(userId: string, token: string) {
    const user = await this.usersService.findById(userId);
    const fullUser = await this.usersService.findByEmail(user!.email, {
      includeTwoFactor: true,
    });

    if (!fullUser?.isTwoFactorEnabled || !fullUser.twoFactorSecret) {
      throw new UnauthorizedException('2FA not enabled for this user');
    }

    const verified = speakeasy.totp.verify({
      secret: fullUser.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      if (fullUser.twoFactorBackupCodes) {
        const hashedCodes = JSON.parse(
          fullUser.twoFactorBackupCodes,
        ) as string[];
        for (let i = 0; i < hashedCodes.length; i++) {
          const valid = await bcrypt.compare(token, hashedCodes[i]);
          if (valid) {
            hashedCodes.splice(i, 1);
            await this.usersService.update(userId, {
              twoFactorBackupCodes: JSON.stringify(hashedCodes),
            });
            return true;
          }
        }
      }
      throw new UnauthorizedException('Invalid 2FA token or backup code');
    }

    return true;
  }

  /**
   * Generate access + refresh token pair.
   */
  async generateTokens(userId: string, email: string, role: string) {
    const jwtPayload = { sub: userId, email, role } as Record<string, unknown>;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessExpiry') as any,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiry') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Hash and store refresh token for rotation validation.
   */
  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.usersService.updateRefreshTokenHash(userId, hash);
  }
}
