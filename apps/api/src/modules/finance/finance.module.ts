import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { FinanceService } from './finance.service';
import { CurrencyConversionService } from './currency-conversion.service';
import { FinanceController } from './finance.controller';
import { Account } from './entities/account.entity';
import { Invoice, InvoiceLine } from './entities/invoice.entity';
import { JournalEntry, JournalLine } from './entities/journal.entity';
import { Bill, BillLine } from './entities/bill.entity';
import { TaxRate } from './entities/tax-rate.entity';
import { AccountingPeriod } from './entities/accounting-period.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { Budget } from './entities/budget.entity';
import { SystemModule } from '../system/system.module';
import { ARReminderProcessor } from './ar-reminder.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Invoice,
      InvoiceLine,
      JournalEntry,
      JournalLine,
      Bill,
      BillLine,
      TaxRate,
      AccountingPeriod,
      BankTransaction,
      Budget,
    ]),
    BullModule.registerQueue({
      name: 'ar_reminders',
    }),
    SystemModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService, ARReminderProcessor, CurrencyConversionService],
  exports: [FinanceService, CurrencyConversionService],
})
export class FinanceModule {}
