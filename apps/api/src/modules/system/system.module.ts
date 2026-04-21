import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantModule as TenantModuleEntity } from './entities/tenant-module.entity';
import { Branch } from './entities/branch.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Holiday } from './entities/holiday.entity';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { StorageService } from './storage.service';
import { AuditService } from './audit.service';
import { PdfService } from './pdf.service';
import { SystemController } from './system.controller';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      TenantModuleEntity,
      Branch,
      AuditLog,
      Holiday,
    ]),
    JwtModule,
  ],
  controllers: [SystemController],
  providers: [
    TenantProvisioningService,
    StorageService,
    AuditService,
    PdfService,
    NotificationsGateway,
  ],
  exports: [
    TenantProvisioningService,
    StorageService,
    AuditService,
    PdfService,
    NotificationsGateway,
  ],
})
export class SystemModule {}
