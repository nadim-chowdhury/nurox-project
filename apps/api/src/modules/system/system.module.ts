import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantModule as TenantModuleEntity } from './entities/tenant-module.entity';
import { Branch } from './entities/branch.entity';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { StorageService } from './storage.service';
import { SystemController } from './system.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantModuleEntity, Branch])],
  controllers: [SystemController],
  providers: [TenantProvisioningService, StorageService],
  exports: [TenantProvisioningService, StorageService],
})
export class SystemModule {}
