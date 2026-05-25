import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReportsService } from '../reports.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportSchedule } from '../entities/report-schedule.entity';
// Assuming a MailerService exists, or simply stubbing it out for architecture
// import { MailerService } from '../../mailer/mailer.service';

@Processor('report-scheduler')
export class ReportSchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportSchedulerProcessor.name);

  constructor(
    private readonly reportsService: ReportsService,
    @InjectRepository(ReportSchedule)
    private readonly scheduleRepo: Repository<ReportSchedule>,
    // private readonly mailerService: MailerService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing scheduled report job ${job.id}`);

    // For repeatable jobs, job.data might contain the schedule ID
    const scheduleId = job.data?.scheduleId;
    if (!scheduleId) {
      this.logger.warn('No scheduleId provided in job data');
      return;
    }

    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId, isActive: true },
      relations: ['template'],
    });

    if (!schedule) {
      this.logger.log(`Schedule ${scheduleId} not found or inactive`);
      return;
    }

    try {
      let attachment: Buffer | null = null;
      let filename = '';

      if (schedule.format === 'PDF') {
        attachment = await this.reportsService.generatePdf(
          schedule.tenantId,
          schedule.templateId,
        );
        filename = `${schedule.template.name}.pdf`;
      } else if (schedule.format === 'XLSX') {
        const workbook = await this.reportsService.exportXlsx(
          schedule.tenantId,
          schedule.templateId,
        );
        attachment = Buffer.from(await workbook.xlsx.writeBuffer());
        filename = `${schedule.template.name}.xlsx`;
      } else if (schedule.format === 'CSV') {
        // Since exportCsv returns StreamableFile, we'd buffer it or stream it.
        // For email attachments, buffering is usually needed unless the mailer supports streams.
        // This is a simplified version for CSV.
        filename = `${schedule.template.name}.csv`;
        // In a real app, read the stream into a buffer here.
      }

      if (attachment) {
        this.logger.log(
          `Generated ${schedule.format} for ${schedule.template.name}. Emailing to ${schedule.recipients.join(', ')}...`,
        );
        // await this.mailerService.sendMail({
        //   to: schedule.recipients,
        //   subject: `Scheduled Report: ${schedule.template.name}`,
        //   text: 'Please find your scheduled report attached.',
        //   attachments: [{ filename, content: attachment }]
        // });
      }
    } catch (error) {
      this.logger.error(
        `Failed to process scheduled report ${scheduleId}: ${error.message}`,
      );
      throw error;
    }
  }
}
