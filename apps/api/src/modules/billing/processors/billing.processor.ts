import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailerService } from '../../mailer/mailer.service';

@Processor('billing')
export class BillingProcessor extends WorkerHost {
  private readonly logger = new Logger(BillingProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case 'trial_reminder': {
          const { email, daysLeft } = job.data;
          await this.mailerService.sendTrialReminderEmail(email, daysLeft);
          break;
        }
        case 'dunning_reminder': {
          const { email, amount, attempt } = job.data;
          await this.mailerService.sendDunningEmail(email, amount, attempt);
          break;
        }
        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
