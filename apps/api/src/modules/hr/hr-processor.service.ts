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
      case 'probation-expiry-check':
        return this.handleProbationExpiry(job.data);
      case 'contract-expiry-check':
        return this.handleContractExpiry(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleProbationExpiry(data: { employeeId: string }) {
    const employee = await this.hrService.findEmployeeById(data.employeeId);
    this.logger.log(
      `Checking probation for ${employee.firstName} ${employee.lastName}`,
    );

    // Send notification to HR/Manager
    await this.mailerService.sendMail({
      to: 'hr@nurox.app', // In real app, get HR manager email
      subject: `Probation Period Expiry: ${employee.firstName} ${employee.lastName}`,
      html: `<p>Employee <b>${employee.firstName} ${employee.lastName}</b>'s probation period is ending on <b>${employee.probationEndDate}</b>.</p>
             <p>Please take necessary action.</p>`,
    });
  }

  private async handleContractExpiry(data: { employeeId: string }) {
    const employee = await this.hrService.findEmployeeById(data.employeeId);
    this.logger.log(
      `Checking contract for ${employee.firstName} ${employee.lastName}`,
    );

    // Send notification to HR/Manager
    await this.mailerService.sendMail({
      to: 'hr@nurox.app',
      subject: `Contract Expiry Warning: ${employee.firstName} ${employee.lastName}`,
      html: `<p>Employee <b>${employee.firstName} ${employee.lastName}</b>'s contract is expiring in 30 days on <b>${employee.contractExpiryDate}</b>.</p>
             <p>Please initiate renewal or termination process.</p>`,
    });
  }
}
