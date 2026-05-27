import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailerService } from '../../mailer/mailer.service';

@Processor('billing')
export class LifecycleProcessor extends WorkerHost {
  private readonly logger = new Logger(LifecycleProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing lifecycle job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case 'export_tenant_data': {
          const { tenantId } = job.data;
          this.logger.log(
            `[STUB] Exporting data for tenant ${tenantId}. Generating ZIP file...`,
          );
          // Implementation would fetch all tenant data, zip it, upload to S3, and email the download link.
          break;
        }
        case 'deletion_reminders': {
          const { tenantId, daysLeft } = job.data;
          this.logger.log(
            `[STUB] Sending deletion reminder to tenant ${tenantId}: ${daysLeft} days left.`,
          );
          // implementation to email the tenant admin
          break;
        }
        default:
          this.logger.warn(
            `Unknown lifecycle job type: ${job.name} (handled by LifecycleProcessor?)`,
          );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process lifecycle job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
