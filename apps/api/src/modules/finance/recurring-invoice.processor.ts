import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RecurringInvoice,
  RecurringFrequency,
} from './entities/recurring-invoice.entity';
import dayjs from 'dayjs';

@Processor('recurring_invoices')
export class RecurringInvoiceProcessor extends WorkerHost {
  private readonly logger = new Logger(RecurringInvoiceProcessor.name);

  constructor(
    private readonly financeService: FinanceService,
    @InjectRepository(RecurringInvoice)
    private readonly recurringRepo: Repository<RecurringInvoice>,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log(`Processing recurring invoices for job ${job.id}`);

    const today = dayjs().format('YYYY-MM-DD');
    const dueInvoices = await this.recurringRepo.find({
      where: {
        isActive: true,
        nextRunDate: today,
      } as any,
    });

    for (const ri of dueInvoices) {
      try {
        this.logger.log(`Generating invoice for recurring template: ${ri.id}`);

        await this.financeService.createInvoice({
          invoiceNumber: `INV-AUTO-${ri.id}-${today}`,
          customerName: ri.customerName,
          customerEmail: ri.customerEmail,
          issueDate: today,
          dueDate: dayjs(today).add(30, 'day').format('YYYY-MM-DD'),
          lines: ri.lines,
          notes: ri.notes,
        } as any);

        // Update last run and next run date
        ri.lastRunAt = new Date();
        ri.nextRunDate = this.calculateNextRunDate(
          ri.nextRunDate!,
          ri.frequency,
        );

        if (ri.endDate && dayjs(ri.nextRunDate).isAfter(ri.endDate)) {
          ri.isActive = false;
        }

        await this.recurringRepo.save(ri);
      } catch (error) {
        this.logger.error(
          `Failed to generate recurring invoice ${ri.id}: ${error.message}`,
        );
      }
    }
  }

  private calculateNextRunDate(
    current: string,
    frequency: RecurringFrequency,
  ): string {
    const date = dayjs(current);
    switch (frequency) {
      case RecurringFrequency.WEEKLY:
        return date.add(1, 'week').format('YYYY-MM-DD');
      case RecurringFrequency.MONTHLY:
        return date.add(1, 'month').format('YYYY-MM-DD');
      case RecurringFrequency.QUARTERLY:
        return date.add(3, 'month').format('YYYY-MM-DD');
      case RecurringFrequency.YEARLY:
        return date.add(1, 'year').format('YYYY-MM-DD');
      default:
        return current;
    }
  }
}
