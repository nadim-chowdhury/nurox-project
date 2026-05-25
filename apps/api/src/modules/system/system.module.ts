import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { Tenant } from './entities/tenant.entity';
import { TenantModule as TenantModuleEntity } from './entities/tenant-module.entity';
import { TenantCustomDomain } from './entities/tenant-custom-domain.entity';
import { Branch } from './entities/branch.entity';
import { WorkingCalendar } from './entities/working-calendar.entity';
import { AuditLog } from './entities/audit-log.entity';
import { LoginEvent } from './entities/login-event.entity';
import { Holiday } from './entities/holiday.entity';
import { Notification } from './entities/notification.entity';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { StorageService } from './storage.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { PdfService } from './pdf.service';
import { GoogleCalendarService } from './google-calendar.service';
import { SystemController } from './system.controller';
import { HealthController } from './health.controller';
import { NotificationController } from './notification.controller';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseInitService } from './database-init.service';
import { LoginEventsListener } from './listeners/login-events.listener';
import { GdprController } from './gdpr.controller';
import { AdminController } from './admin.controller';
import { SecurityController } from './security.controller';
import { ConsentLog } from './entities/consent-log.entity';
import { AuditCleanupProcessor } from './processors/audit-cleanup.processor';
import { RedisModule } from '../redis/redis.module';

import { CustomFieldDefinition } from './entities/custom-field-definition.entity';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { AutoNumberSequence } from './entities/auto-number-sequence.entity';
import { ApprovalWorkflow } from './entities/approval-workflow.entity';
import { ApprovalStep } from './entities/approval-step.entity';
import { SystemAnnouncement } from './entities/system-announcement.entity';
import { ApiKey } from './entities/api-key.entity';

import { SuperAdminController } from './superadmin.controller';
import { DatabaseBackupProcessor } from './processors/database-backup.processor';
import { RecycleBinProcessor } from './processors/recycle-bin.processor';
import { VirusScanProcessor } from './processors/virus-scan.processor';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ApiKeyService } from './api-key.service';
import { BulkImportService } from './bulk-import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      TenantModuleEntity,
      TenantCustomDomain,
      Branch,
      WorkingCalendar,
      AuditLog,
      LoginEvent,
      Holiday,
      Notification,
      ConsentLog,
      CustomFieldDefinition,
      CustomFieldValue,
      AutoNumberSequence,
      ApprovalWorkflow,
      ApprovalStep,
      SystemAnnouncement,
      ApiKey,
    ]),
    TerminusModule, // Health checks for K8s probes
    JwtModule,
    RedisModule,
    BullModule.registerQueue(
      { name: 'database-backup' },
      { name: 'recycle-bin' },
      { name: 'report-scheduler' },
      { name: 'virus-scan' },
    ),
    BullBoardModule.forFeature({
      name: 'database-backup',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'recycle-bin',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'report-scheduler',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'virus-scan',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [
    SystemController,
    HealthController,
    NotificationController,
    GdprController,
    AdminController,
    SuperAdminController,
    SecurityController,
  ],
  providers: [
    TenantProvisioningService,
    StorageService,
    AuditService,
    // AuditSubscriber,
    PdfService,
    GoogleCalendarService,
    NotificationsGateway,
    NotificationService,
    DatabaseInitService,
    LoginEventsListener,
    AuditCleanupProcessor,
    DatabaseBackupProcessor,
    RecycleBinProcessor,
    VirusScanProcessor,
    ApiKeyService,
    BulkImportService,
  ],
  exports: [
    TypeOrmModule,
    TenantProvisioningService,
    StorageService,
    AuditService,
    // AuditSubscriber,
    PdfService,
    GoogleCalendarService,
    NotificationsGateway,
    NotificationService,
    ApiKeyService,
    BulkImportService,
  ],
})
export class SystemModule {}
