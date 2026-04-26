import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HrService } from './hr.service';
import { MailerService } from '../mailer/mailer.service';

@Processor('hr')
export class HrProcessor extends WorkerHost {
  private readonly logger = new Logger(HrProcessor.name);

  constructor(
    private readonly hrService: HrService,
    private readonly mailerService: MailerService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'probation-expiry-reminder':
        return this.handleProbationReminder(job.data);
      case 'contract-expiry-reminder':
        return this.handleContractReminder(job.data);
      case 'daily-milestone-check':
        return this.handleDailyMilestones();
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleDailyMilestones() {
    this.logger.log('Starting daily milestone check (Birthdays/Anniversaries)');
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    // Find birthdays
    const employees = await (this.hrService as any).employeeRepo.find();

    for (const emp of employees) {
      if (emp.dateOfBirth) {
        const dob = new Date(emp.dateOfBirth);
        if (dob.getDate() === day && dob.getMonth() + 1 === month) {
          await this.mailerService.sendMail({
            to: emp.email,
            subject: `Happy Birthday, ${emp.firstName}! 🎂`,
            html: `<p>Dear ${emp.firstName},</p><p>Wishing you a very happy birthday from all of us at Nurox!</p>`,
          });
        }
      }

      if (emp.joinDate) {
        const join = new Date(emp.joinDate);
        if (
          join.getDate() === day &&
          join.getMonth() + 1 === month &&
          join.getFullYear() < today.getFullYear()
        ) {
          const years = today.getFullYear() - join.getFullYear();
          await this.mailerService.sendMail({
            to: emp.email,
            subject: `Happy Work Anniversary! 🎊`,
            html: `<p>Dear ${emp.firstName},</p><p>Congratulations on completing <b>${years} year(s)</b> with Nurox!</p>`,
          });
        }
      }
    }
  }

  private async handleProbationReminder(data: {
    employeeId: string;
    daysLeft: number;
  }) {
    const employee = await this.hrService.findEmployeeById(data.employeeId);
    this.logger.log(
      `Probation reminder: ${data.daysLeft} days left for ${employee.firstName} ${employee.lastName}`,
    );

    await this.mailerService.sendMail({
      to: 'hr@nurox.app',
      subject: `Probation Reminder (${data.daysLeft} days): ${employee.firstName} ${employee.lastName}`,
      html: `<p>Employee <b>${employee.firstName} ${employee.lastName}</b>'s probation period is ending in <b>${data.daysLeft} days</b> (on ${employee.probationEndDate}).</p>
             <p>Please review performance and initiate confirmation or extension.</p>`,
    });
  }

  private async handleContractReminder(data: {
    employeeId: string;
    daysLeft: number;
  }) {
    const employee = await this.hrService.findEmployeeById(data.employeeId);
    this.logger.log(
      `Contract reminder: ${data.daysLeft} days left for ${employee.firstName} ${employee.lastName}`,
    );

    await this.mailerService.sendMail({
      to: 'hr@nurox.app',
      subject: `Contract Expiry Reminder (${data.daysLeft} days): ${employee.firstName} ${employee.lastName}`,
      html: `<p>Employee <b>${employee.firstName} ${employee.lastName}</b>'s contract is expiring in <b>${data.daysLeft} days</b> (on ${employee.contractExpiryDate}).</p>
             <p>Please initiate renewal or termination process.</p>`,
    });
  }
}
