import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '../mailer/mailer.service';
import { Logger } from '@nestjs/common';

@Processor('recruitment')
export class RecruitmentProcessor extends WorkerHost {
  private readonly logger = new Logger(RecruitmentProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'application.rejected':
        await this.handleApplicationRejected(job.data);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleApplicationRejected(data: {
    email: string;
    firstName: string;
    jobTitle: string;
  }) {
    this.logger.log(`Sending rejection email to ${data.email}`);
    await this.mailerService.sendMail({
      to: data.email,
      subject: `Application Update: ${data.jobTitle} — Nurox ERP`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Update on your application</h2>
          <p>Dear ${data.firstName},</p>
          <p>Thank you for your interest in the <strong>${data.jobTitle}</strong> position at Nurox ERP and for the time you spent during the application process.</p>
          <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
          <p>We appreciate your interest in our company and wish you the best of luck in your job search.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Best regards,<br/>The Recruitment Team<br/>Nurox ERP</p>
        </div>
      `,
    });
  }
}
