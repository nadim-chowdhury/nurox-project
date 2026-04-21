import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission, RolePermissions } from '../enums/permissions.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Enforce JWT authentication happened
    if (!user) {
      throw new ForbiddenException('User authentication required');
    }

    // Determine user's activated permissions based on their decoded Role
    // Next iteration: fetch from DB/User object directly if dynamically bound
    const userRole = user.role || 'GUEST';
    const activePermissions = RolePermissions[userRole] || [];

    // Check if user has ALL required permissions to access this route
    const hasPermission = requiredPermissions.every((perm) =>
      activePermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Missing: ${requiredPermissions.filter((p) => !activePermissions.includes(p)).join(', ')}`,
      );
    }

    return true;
  }
}
