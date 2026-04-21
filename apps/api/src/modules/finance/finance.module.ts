import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Account } from './entities/account.entity';
import { Invoice, InvoiceLine } from './entities/invoice.entity';
import { JournalEntry, JournalLine } from './entities/journal.entity';
import { Bill, BillLine } from './entities/bill.entity';
import { TaxRate } from './entities/tax-rate.entity';
import { AccountingPeriod } from './entities/accounting-period.entity';
import { BankTransaction } from './entities/bank-transaction.entity';

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
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
