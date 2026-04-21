import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface User {
  id: string;
  email: string;
  role: string;
  permissions?: string[];
}

interface RequestWithUser {
  user: User;
}

/**
 * Extracts the authenticated user from the request.
 * The user object is set by JwtStrategy.validate().
 *
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: { id: string; email: string; role: string }) {
 *   return user;
 * }
 *
 * // Extract a single property:
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: string) {
 *   return { userId };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (data && user) {
      return user[data];
    }
    return user;
  },
);
