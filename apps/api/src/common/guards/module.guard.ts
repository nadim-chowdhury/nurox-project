import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { TenantModule } from '../../modules/system/entities/tenant-module.entity';

export const MODULE_KEY = 'module_key';
export const CheckModule = (moduleKey: string) =>
  SetMetadata(MODULE_KEY, moduleKey);

@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleKey = this.reflector.get<string>(
      MODULE_KEY,
      context.getHandler(),
    );
    if (!moduleKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId;

    if (!tenantId) {
      return true; // Or false, depending on if you want to enforce tenant context
    }

    const tenantModule = await this.dataSource
      .getRepository(TenantModule)
      .findOne({
        where: { tenantId, moduleKey, isEnabled: true },
      });

    if (!tenantModule) {
      throw new ForbiddenException(
        `The "${moduleKey}" module is not enabled for this tenant. Please upgrade your plan.`,
      );
    }

    return true;
  }
}
