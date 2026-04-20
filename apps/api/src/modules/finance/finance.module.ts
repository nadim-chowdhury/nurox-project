import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Account } from './entities/account.entity';
import { Invoice, InvoiceLine } from './entities/invoice.entity';
import { JournalEntry, JournalLine } from './entities/journal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Invoice,
      InvoiceLine,
      JournalEntry,
      JournalLine,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
