import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { Tenant } from './entities/tenant.entity';
import { TenantModule as TenantModuleEntity } from './entities/tenant-module.entity';
import { Branch } from './entities/branch.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Holiday } from './entities/holiday.entity';
import { Notification } from './entities/notification.entity';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { StorageService } from './storage.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { AuditSubscriber } from '../../common/subscribers/audit.subscriber';
import { PdfService } from './pdf.service';
import { SystemController } from './system.controller';
import { HealthController } from './health.controller';
import { NotificationController } from './notification.controller';
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
      Notification,
    ]),
    TerminusModule, // Health checks for K8s probes
    JwtModule,
  ],
  controllers: [SystemController, HealthController, NotificationController],
  providers: [
    TenantProvisioningService,
    StorageService,
    AuditService,
    AuditSubscriber,
    PdfService,
    NotificationsGateway,
    NotificationService,
  ],
  exports: [
    TenantProvisioningService,
    StorageService,
    AuditService,
    AuditSubscriber,
    PdfService,
    NotificationsGateway,
    NotificationService,
  ],
})
export class SystemModule {}
