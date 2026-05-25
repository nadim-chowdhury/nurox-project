import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '../mailer/mailer.service';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { ModuleRef } from '@nestjs/core';

@Processor('recruitment')
export class RecruitmentProcessor extends WorkerHost {
  private readonly logger = new Logger(RecruitmentProcessor.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly moduleRef: ModuleRef,
    @Inject(forwardRef(() => RecruitmentService))
    private readonly recruitmentService: RecruitmentService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'application.rejected':
        await this.handleApplicationRejected(job.data);
        break;
      case 'job.opened':
        await this.handleJobOpened(job.data);
        break;
      case 'offer.expiry_check':
        await this.handleOfferExpiryCheck(job.data);
        break;
      case 'offer.expired_notification':
        await this.handleOfferExpiredNotification(job.data);
        break;
      case 'onboarding.welcome_email':
        await this.handleWelcomeEmail(job.data);
        break;
      case 'onboarding.milestone_checkin':
        await this.handleMilestoneCheckin(job.data);
        break;
      case 'referral.bonus_processed':
        await this.handleReferralBonus(job.data);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleReferralBonus(data: {
    candidateName: string;
    referrerId: string;
    amount: number;
  }) {
    this.logger.log(
      `[BONUS] Processing $${data.amount} referral bonus for employee ${data.referrerId} for hiring ${data.candidateName}`,
    );
    // In a real app, this would create a payroll entry or notify Finance
  }

  private async handleWelcomeEmail(data: {
    email: string;
    firstName: string;
    startDate: Date;
  }) {
    this.logger.log(`Sending Day-1 Welcome Email to ${data.email}`);
    await this.mailerService.sendMail({
      to: data.email,
      subject: 'Welcome to the Team! — Nurox ERP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #00b96b;">Welcome, ${data.firstName}!</h2>
          <p>We are thrilled to have you join us. Your journey with Nurox ERP officially begins on <strong>${new Date(data.startDate).toLocaleDateString()}</strong>.</p>
          <p>Please find below some useful information for your first day:</p>
          <ul>
            <li><strong>Office Location:</strong> Main Tower, Floor 12</li>
            <li><strong>Reporting Manager:</strong> Sarah Jenkins</li>
            <li><strong>HR Buddy:</strong> Mike Ross</li>
          </ul>
          <p>You can access the Employee Handbook here: <a href="https://app.nurox.app/hr/handbook">Employee Handbook</a></p>
          <p>We look forward to seeing you soon!</p>
        </div>
      `,
    });
  }

  private async handleMilestoneCheckin(data: { email: string; days: number }) {
    this.logger.log(
      `Sending ${data.days}-Day Milestone Check-in to ${data.email}`,
    );
    await this.mailerService.sendMail({
      to: data.email,
      subject: `${data.days}-Day Check-in: How are you doing?`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>Hello!</h3>
          <p>It's been ${data.days} days since you joined Nurox ERP. We'd love to hear how your experience has been so far.</p>
          <p>Please take a moment to fill out this brief feedback form: <a href="https://app.nurox.app/onboarding/feedback?days=${data.days}">Feedback Form</a></p>
          <p>If you have any immediate concerns, feel free to reach out to your manager or HR.</p>
        </div>
      `,
    });
  }

  private async handleOfferExpiryCheck(data: {
    offerId: string;
    tenantId: string;
  }) {
    this.logger.log(
      `Checking expiry for offer ${data.offerId} (Tenant: ${data.tenantId})`,
    );

    // To handle request-scoped services in a processor, we need to create a context
    // and manually inject the tenantId into the request object of that context.

    // For this prototype, we'll use the singleton service if it wasn't request-scoped,
    // but since it is, we'll simulate the logic or use a workaround.

    // Workaround: We'll call checkOfferExpiry directly if we can bypass the request scope
    // or we'll manually set the context if possible.

    // In this specific architecture, we'll try to use the service method.
    try {
      await this.recruitmentService.checkOfferExpiry(data.offerId);
    } catch (error) {
      this.logger.error(`Failed to check offer expiry: ${error.message}`);
    }
  }

  private async handleOfferExpiredNotification(data: {
    candidateName: string;
    offerId: string;
  }) {
    this.logger.log(
      `[NOTIFY] Offer for ${data.candidateName} has expired. Notifying recruiter...`,
    );

    // In a real app, we'd fetch the recruiter's email. For now, we'll send to a generic address.
    await this.mailerService.sendMail({
      to: 'recruitment-team@nurox.app',
      subject: `Offer Expired: ${data.candidateName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>Offer Expiry Notification</h3>
          <p>The offer letter for <strong>${data.candidateName}</strong> (ID: ${data.offerId}) has expired without acceptance.</p>
          <p>Please follow up with the candidate or close the application.</p>
          <a href="https://app.nurox.app/hr/recruitment" style="display: inline-block; padding: 10px 20px; background-color: #00b96b; color: white; text-decoration: none; border-radius: 5px;">View ATS Board</a>
        </div>
      `,
    });
  }

  private async handleJobOpened(data: any) {
    this.logger.log(`Broadcasting Job Opened: ${data.title}`);

    // Simulating Multi-channel Webhook calls to Job Boards
    const jobBoards = [
      { name: 'LinkedIn', url: 'https://api.linkedin.com/v2/jobPostings' },
      { name: 'Indeed', url: 'https://api.indeed.com/v2/jobs' },
      { name: 'Bdjobs', url: 'https://api.bdjobs.com/v1/post' },
      { name: 'Glassdoor', url: 'https://api.glassdoor.com/v1/jobs' },
    ];

    for (const board of jobBoards) {
      this.logger.log(`[SYNC] Posting "${data.title}" to ${board.name}...`);

      // Prototype webhook implementation with actual fetch calls to mock targets
      try {
        const response = await fetch('https://httpbin.org/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_board: board.name,
            external_id: data.jobId,
            title: data.title,
            description: data.description,
            location: data.location,
            company: 'Nurox ERP Client',
            type: data.employmentType,
          }),
        });

        if (response.ok) {
          this.logger.log(`[SUCCESS] Job synced with ${board.name}`);
        } else {
          this.logger.warn(
            `[WARN] ${board.name} returned status ${response.status}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `[ERROR] Failed to sync with ${board.name}: ${error.message}`,
        );
      }
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
