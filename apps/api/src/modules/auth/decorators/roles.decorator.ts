import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict access to specific user roles.
 * Used in combination with JwtAuthGuard + RolesGuard.
 *
 * @example
 * @Roles('ADMIN', 'HR_MANAGER')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('employees')
 * findAll() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
