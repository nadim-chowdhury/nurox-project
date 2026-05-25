import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RecurringJournal,
  RecurringFrequency,
} from './entities/recurring-journal.entity';
import dayjs from 'dayjs';

@Processor('recurring_journals')
export class RecurringJournalProcessor extends WorkerHost {
  private readonly logger = new Logger(RecurringJournalProcessor.name);

  constructor(
    private readonly financeService: FinanceService,
    @InjectRepository(RecurringJournal)
    private readonly recurringRepo: Repository<RecurringJournal>,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log(`Processing recurring journals for job ${job.id}`);

    const today = dayjs().format('YYYY-MM-DD');
    const dueJournals = await this.recurringRepo.find({
      where: {
        isActive: true,
        nextRunDate: today,
      } as any,
    });

    for (const rj of dueJournals) {
      try {
        this.logger.log(`Executing recurring journal: ${rj.name} (${rj.id})`);

        await this.financeService.createJournalEntry({
          entryNumber: `RJ-${rj.id}-${today}`,
          entryDate: today,
          description: rj.description || `Recurring entry: ${rj.name}`,
          currency: rj.currency,
          lines: rj.lines,
        } as any);

        // Update last run and next run date
        rj.lastRunAt = new Date();
        rj.nextRunDate = this.calculateNextRunDate(
          rj.nextRunDate!,
          rj.frequency,
        );

        if (rj.endDate && dayjs(rj.nextRunDate).isAfter(rj.endDate)) {
          rj.isActive = false;
        }

        await this.recurringRepo.save(rj);
      } catch (error) {
        this.logger.error(
          `Failed to execute recurring journal ${rj.id}: ${error.message}`,
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
      case RecurringFrequency.DAILY:
        return date.add(1, 'day').format('YYYY-MM-DD');
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
