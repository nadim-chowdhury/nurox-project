import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { AuditLog } from '../entities/audit-log.entity';

@Processor('audit-cleanup')
@Injectable()
export class AuditCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditCleanupProcessor.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log('Starting audit log cleanup...');

    const tenants = await this.tenantRepo.find({
      select: ['id', 'auditLogRetentionDays'],
    });

    for (const tenant of tenants) {
      const retentionDays = tenant.auditLogRetentionDays || 730; // default 2 years
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.auditLogRepo.delete({
        tenantId: tenant.id,
        createdAt: LessThan(cutoffDate),
      });

      if (result.affected && result.affected > 0) {
        this.logger.log(
          `Deleted ${result.affected} old audit logs for tenant ${tenant.id}`,
        );
      }
    }

    this.logger.log('Finished audit log cleanup.');
  }
}
