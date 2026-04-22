import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailerService } from '../mailer/mailer.service';

@Processor('ar_reminders')
export class ARReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(ARReminderProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { customerEmail, invoiceNumber, amount } = job.data;

    if (!customerEmail) {
      this.logger.warn(
        `No email found for invoice ${invoiceNumber}, skipping reminder.`,
      );
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: customerEmail,
        subject: `Payment Reminder: Invoice ${invoiceNumber}`,
        html: `
          <h3>Payment Reminder</h3>
          <p>This is a reminder that your invoice <strong>${invoiceNumber}</strong> is overdue.</p>
          <p>Outstanding Amount: <strong>$${amount.toFixed(2)}</strong></p>
          <p>Please make the payment as soon as possible.</p>
        `,
      });
      this.logger.log(
        `Reminder sent for invoice ${invoiceNumber} to ${customerEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send reminder for invoice ${invoiceNumber}: ${error.message}`,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
