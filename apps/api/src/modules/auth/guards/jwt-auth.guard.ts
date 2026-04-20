import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that triggers the 'jwt' Passport strategy.
 * Apply to routes/controllers that require authentication.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('profile')
 *   getProfile(@CurrentUser() user) { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
