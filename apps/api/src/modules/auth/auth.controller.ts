import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { randomBytes } from 'crypto';
import { AuthService, OAuthProfile } from './auth.service';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RequirePermissions } from './decorators/permissions.decorator';
import { RolePermissions, Permission } from './enums/permissions.enum';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verify2FASchema,
  enable2FASchema,
  magicLinkRequestSchema,
  magicLinkLoginSchema,
  changePasswordSchema,
  type RegisterDto,
  type LoginDto,
  type ForgotPasswordDto,
  type ResetPasswordDto,
  type Verify2FADto,
  type Enable2FADto,
  type MagicLinkRequestDto,
  type MagicLinkLoginDto,
  type ChangePasswordDto,
} from '@repo/shared-schemas';

const REFRESH_COOKIE_NAME = 'nurox_refresh_token';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const parsed = registerSchema.parse(body);
    const result = await this.authService.register(parsed);

    // Set refresh token as httpOnly cookie
    res.cookie(
      REFRESH_COOKIE_NAME,
      result.tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    return {
      user: result.user,
      tokens: {
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const parsed = loginSchema.parse(body);
    const tenantId = req.headers['x-tenant-id'] as string;

    const result = await this.authService.login(parsed.email, parsed.password, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      tenantId,
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      result.tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    return {
      user: result.user,
      tokens: {
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using httpOnly cookie' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];
    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED);
      return { message: 'No refresh token' };
    }

    const tokens = await this.authService.refresh(refreshToken, {
      ipAddress: req.ip || '',
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    return {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — invalidate refresh token' })
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];
    if (refreshToken) {
      await this.authService.logout(userId, refreshToken);
    }

    // Clear the refresh token cookie
    res.clearCookie(REFRESH_COOKIE_NAME, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 0,
    });

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(
    @CurrentUser() user: { id: string; email: string; role: string },
  ) {
    const dbRole = await this.rolesService.findByName(user.role);
    const permissions = dbRole
      ? dbRole.permissions
      : RolePermissions[user.role] || [];

    return {
      ...user,
      permissions,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate forgot password flow' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const parsed = forgotPasswordSchema.parse(body);
    await this.authService.forgotPassword(parsed.email);
    return { message: 'If an account exists, a reset link has been sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    const parsed = resetPasswordSchema.parse(body);
    await this.authService.resetPassword(
      parsed.email,
      parsed.token,
      parsed.newPassword,
    );
    return { message: 'Password has been reset successfully' };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email using token' })
  async verifyEmail(@Body() body: { email: string; token: string }) {
    await this.authService.verifyEmail(body.email, body.token);
    return { message: 'Email verified successfully' };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerification(@Body() body: { email: string }) {
    await this.authService.resendVerification(body.email);
    return { message: 'Verification email sent' };
  }

  @Post('sms-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request an SMS OTP for login' })
  async requestSmsOtp(@Body() body: { phone: string }) {
    await this.authService.requestSmsOtp(body.phone);
    return { message: 'If an account exists, an OTP has been sent' };
  }

  @Post('sms-otp/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with SMS OTP' })
  async smsOtpLogin(
    @Body() body: { phone: string; code: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginWithSmsOtp(
      body.phone,
      body.code,
      {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    );

    res.cookie(
      REFRESH_COOKIE_NAME,
      result.tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    return {
      user: result.user,
      tokens: {
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
    };
  }

  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a passwordless magic login link' })
  async requestMagicLink(@Body() body: MagicLinkRequestDto) {
    const parsed = magicLinkRequestSchema.parse(body);
    await this.authService.sendMagicLink(parsed.email);
    return { message: 'If an account exists, a magic link has been sent' };
  }

  @Post('magic-link/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with magic link token' })
  async magicLinkLogin(
    @Body() body: MagicLinkLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const parsed = magicLinkLoginSchema.parse(body);
    const result = await this.authService.loginWithMagicLink(parsed.token, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      result.tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    return {
      user: result.user,
      tokens: {
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google auth callback' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.validateOAuthUser(
      req.user as OAuthProfile,
    );
    const familyId = randomBytes(16).toString('hex');
    const tokens = await this.authService.generateTokens(
      user.id,
      user.email,
      user.role,
      familyId,
    );

    res.cookie(
      REFRESH_COOKIE_NAME,
      tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    const frontendUrl = (
      process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000'
    )
      .split(',')[0]
      .trim();
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${tokens.accessToken}`,
    );
  }

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Login with Microsoft' })
  async microsoftAuth() {}

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Microsoft auth callback' })
  async microsoftAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.validateOAuthUser(
      req.user as OAuthProfile,
    );
    const familyId = randomBytes(16).toString('hex');
    const tokens = await this.authService.generateTokens(
      user.id,
      user.email,
      user.role,
      familyId,
    );

    res.cookie(
      REFRESH_COOKIE_NAME,
      tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    const frontendUrl = (
      process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000'
    )
      .split(',')[0]
      .trim();
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${tokens.accessToken}`,
    );
  }

  @Get('saml')
  @UseGuards(AuthGuard('saml'))
  @ApiOperation({ summary: 'Login with SAML' })
  async samlAuth() {}

  @Post('saml/callback')
  @UseGuards(AuthGuard('saml'))
  @ApiOperation({ summary: 'SAML auth callback' })
  async samlAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.validateOAuthUser(
      req.user as OAuthProfile,
    );
    const familyId = randomBytes(16).toString('hex');
    const tokens = await this.authService.generateTokens(
      user.id,
      user.email,
      user.role,
      familyId,
    );

    res.cookie(
      REFRESH_COOKIE_NAME,
      tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    const frontendUrl = (
      process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000'
    )
      .split(',')[0]
      .trim();
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${tokens.accessToken}`,
    );
  }

  @Get('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get 2FA setup QR code' })
  async setup2FA(@CurrentUser('id') userId: string) {
    return this.authService.generate2FA(userId);
  }

  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA for account' })
  async enable2FA(
    @CurrentUser('id') userId: string,
    @Body() body: Enable2FADto,
  ) {
    const parsed = enable2FASchema.parse(body);
    return this.authService.enable2FA(userId, parsed.token);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA token during login' })
  async verify2FA(@Body() body: Verify2FADto) {
    const parsed = verify2FASchema.parse(body);
    await this.authService.verify2FA(parsed.userId, parsed.token);
    return { message: '2FA verified successfully' };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all active sessions' })
  async getSessions(@CurrentUser('id') userId: string, @Req() req: Request) {
    const currentToken = (req as { cookies?: Record<string, string> })
      .cookies?.[REFRESH_COOKIE_NAME];
    return this.authService.getSessions(userId, currentToken);
  }

  @Get('login-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent login activity' })
  async getLoginHistory(@CurrentUser('id') userId: string) {
    return this.authService.getLoginHistory(userId);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    await this.authService.revokeSession(sessionId, userId);
    return { message: 'Session revoked successfully' };
  }

  @Delete('admin/sessions/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Revoke any specific session' })
  async adminRevokeSession(@Param('id') sessionId: string) {
    await this.authService.revokeSession(sessionId);
    return { message: 'Session revoked by admin' };
  }

  @Post('admin/unlock')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Unlock an account or IP' })
  async adminUnlock(@Body() body: { email?: string; ip?: string }) {
    await this.authService.unlock(body.email, body.ip);
    return { message: 'Account/IP unlocked successfully' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() body: ChangePasswordDto,
  ) {
    const parsed = changePasswordSchema.parse(body);
    await this.authService.changePassword(userId, parsed);
    return { message: 'Password changed successfully' };
  }
}
