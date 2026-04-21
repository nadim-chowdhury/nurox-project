import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantModule as TenantModuleEntity } from './entities/tenant-module.entity';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { SystemController } from './system.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantModuleEntity])],
  controllers: [SystemController],
  providers: [TenantProvisioningService],
  exports: [TenantProvisioningService],
})
export class SystemModule {}
