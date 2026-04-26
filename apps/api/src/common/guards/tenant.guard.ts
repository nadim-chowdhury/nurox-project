import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Membership } from '../../modules/auth/entities/membership.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.tenantId;

    // If no tenant context is required, allow (should be handled by middleware)
    if (!tenantId) {
      return true;
    }

    // If no user is authenticated, we can't check membership
    // This guard should run after JwtAuthGuard
    if (!user) {
      return false;
    }

    // Check if user is a member of this tenant
    const membership = await this.dataSource.getRepository(Membership).findOne({
      where: { userId: user.id, tenantId, isActive: true },
      relations: ['role'],
    });

    if (!membership) {
      throw new ForbiddenException(`You do not have access to this tenant.`);
    }

    // Attach membership to request for downstream use (like permission checks)
    request['membership'] = membership;
    request['role'] = membership.role;

    return true;
  }
}
