import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PayrollService } from './payroll.service';
import { MailerService } from '../mailer/mailer.service';

@Processor('payroll')
export class PayrollProcessor extends WorkerHost {
  private readonly logger = new Logger(PayrollProcessor.name);

  constructor(
    private readonly payrollService: PayrollService,
    private readonly mailerService: MailerService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'process-payroll':
        return this.handlePayrollProcessing(job.data);
      case 'distribute-payslips':
        return this.handlePayslipDistribution(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handlePayrollProcessing(data: {
    runId: string;
    filters?: any;
    tenantId: string;
  }) {
    this.logger.log(`Background processing for payroll run: ${data.runId}`);
    try {
      // We'll need a way to run this within the correct tenant context.
      // Since this is a background job, we'll pass tenantId and set it in the service if needed.
      // Or we can just call a specialized method in PayrollService.
      await this.payrollService.executeRunComputation(
        data.runId,
        data.tenantId,
        data.filters,
      );
      this.logger.log(`Completed processing for run: ${data.runId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process payroll run ${data.runId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async handlePayslipDistribution(data: { runId: string }) {
    this.logger.log(`Distributing payslips for run: ${data.runId}`);

    const payslips = await this.payrollService.getPayslipsByRun(data.runId);

    for (const payslip of payslips) {
      try {
        await this.mailerService.sendMail({
          to: payslip.employee.email,
          subject: `Payslip for period ${payslip.payrollRun.period}`,
          html: `<p>Dear ${payslip.employee.firstName},</p>
                 <p>Your payslip for <b>${payslip.payrollRun.period}</b> is now available in the employee portal.</p>
                 <p>Net Pay: <b>${payslip.netPay}</b></p>
                 <p>Regards,<br/>Payroll Team</p>`,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send payslip to ${payslip.employee.email}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Completed payslip distribution for run: ${data.runId}`);
  }
}
