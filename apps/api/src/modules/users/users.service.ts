import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../mailer/mailer.service';
import { StorageService } from '../system/storage.service';
import {
  InviteUserDto,
  UserListQueryDto,
  userListQuerySchema,
} from '@repo/shared-schemas';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailerService: MailerService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Find user by email with optional field inclusion.
   */
  async findByEmail(
    email: string,
    options: {
      includePassword?: boolean;
      includeResetFields?: boolean;
      includeTwoFactor?: boolean;
      includeVerificationFields?: boolean;
    } = {},
  ): Promise<User | null> {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email.toLowerCase() });

    if (options.includePassword) {
      qb.addSelect('user.passwordHash');
    }
    if (options.includeResetFields) {
      qb.addSelect([
        'user.resetPasswordTokenHash',
        'user.resetPasswordExpires',
      ]);
    }
    if (options.includeTwoFactor) {
      qb.addSelect([
        'user.twoFactorSecret',
        'user.isTwoFactorEnabled',
        'user.twoFactorBackupCodes',
      ]);
    }
    if (options.includeVerificationFields) {
      qb.addSelect([
        'user.emailVerificationTokenHash',
        'user.emailVerificationExpires',
      ]);
    }

    return qb.getOne();
  }

  /**
   * Find user by ID. Optionally include refreshTokenHash for token rotation.
   */
  async findById(
    id: string,
    includeRefreshToken = false,
  ): Promise<User | null> {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id });

    if (includeRefreshToken) {
      qb.addSelect('user.refreshTokenHash');
    }

    return qb.getOne();
  }

  /**
   * Find user by phone number.
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { phone } });
  }

  /**
   * Find user by ID or throw 404.
   */
  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  /**
   * List users with pagination and filters.
   */
  async findAll(query: UserListQueryDto) {
    const parsed = userListQuerySchema.parse(query);
    const { page, limit, search, role, status, sortBy, sortOrder } = parsed;

    const qb = this.usersRepo.createQueryBuilder('user');

    if (search) {
      qb.andWhere(
        '(user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.email ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    if (role) qb.andWhere('user.role = :role', { role });
    if (status) qb.andWhere('user.status = :status', { status });

    qb.orderBy(`user.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Create a new user (password should already be hashed).
   */
  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  /**
   * Invite a new user by email.
   */
  async invite(dto: InviteUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.usersRepo.create({
      ...dto,
      status: 'PENDING_INVITE',
      passwordHash: '', // No password yet
      forcePasswordChange: true,
    });

    const saved = await this.usersRepo.save(user);

    // Generate signed token (48h)
    const token = await this.jwtService.signAsync(
      { sub: saved.id, email: saved.email, purpose: 'invite' },
      {
        secret: this.config.get<string>('jwt.refreshSecret'), // Reusing refresh secret
        expiresIn: '48h',
      },
    );

    await this.mailerService.sendInviteEmail(
      saved.email,
      token,
      saved.firstName,
    );
    this.logger.log(`Invite link for ${saved.email} sent.`);

    return saved;
  }

  /**
   * Update user fields.
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    await this.findByIdOrFail(id);
    await this.usersRepo.update(id, data);
    this.logger.log(`User updated: ${id}`);
    return this.findByIdOrFail(id);
  }

  /**
   * Update refresh token hash (for token rotation).
   */
  async updateRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.usersRepo.update(id, { refreshTokenHash: hash });
  }

  /**
   * Generate pre-signed URL for avatar upload.
   */
  async getAvatarUploadUrl(userId: string, contentType: string) {
    const key = `avatars/${userId}/${Date.now()}`;
    const uploadUrl = await this.storageService.getUploadPresignedUrl(
      key,
      contentType,
    );
    return { uploadUrl, key };
  }

  /**
   * Bulk create users (for CSV import).
   */
  async bulkCreate(users: Partial<User>[]): Promise<User[]> {
    const createdUsers = this.usersRepo.create(users);
    return this.usersRepo.save(createdUsers);
  }

  /**
   * Soft delete a user.
   */
  async remove(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.usersRepo.softDelete(id);
    this.logger.log(`User soft-deleted: ${id}`);
  }
}
