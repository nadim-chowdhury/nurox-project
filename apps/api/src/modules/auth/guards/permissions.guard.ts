import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, RolePermissions } from '../enums/permissions.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    // Try to find role in DB
    const dbRole = await this.roleRepo.findOne({ where: { name: user.role } });

    let userPermissions: Permission[] = [];
    if (dbRole) {
      userPermissions = dbRole.permissions;
    } else {
      // Fallback to hardcoded mapping
      userPermissions = RolePermissions[user.role] || [];
    }

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
