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
import { BankAccount } from './entities/bank-account.entity';
import { Budget } from './entities/budget.entity';
import { CurrencyRate } from './entities/currency-rate.entity';
import { RecurringJournal } from './entities/recurring-journal.entity';
import { RecurringInvoice } from './entities/recurring-invoice.entity';
import { CreditNote } from './entities/credit-note.entity';
import { ExpenseClaim } from './entities/expense-claim.entity';
import {
  PettyCashFund,
  PettyCashTransaction,
} from './entities/petty-cash.entity';
import { Grn as GRN } from '../procurement/entities/grn.entity';
import { PurchaseOrder } from '../procurement/entities/purchase-order.entity';
import { SystemModule } from '../system/system.module';
import { ARReminderProcessor } from './ar-reminder.processor';
import { RecurringJournalProcessor } from './recurring-journal.processor';
import { RecurringInvoiceProcessor } from './recurring-invoice.processor';
import { BankReconciliationService } from './services/bank-reconciliation.service';
import {
  PaymentBatch,
  PaymentBatchItem,
} from './entities/payment-batch.entity';
import { PaymentBatchService } from './services/payment-batch.service';
import { Vendor } from '../procurement/entities/vendor.entity';

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
      BankAccount,
      Budget,
      CurrencyRate,
      RecurringJournal,
      RecurringInvoice,
      CreditNote,
      ExpenseClaim,
      PettyCashFund,
      PettyCashTransaction,
      GRN,
      PurchaseOrder,
      PaymentBatch,
      PaymentBatchItem,
      Vendor,
    ]),
    BullModule.registerQueue(
      { name: 'ar_reminders' },
      { name: 'recurring_journals' },
      { name: 'recurring_invoices' },
    ),
    SystemModule,
  ],
  controllers: [FinanceController],
  providers: [
    FinanceService,
    ARReminderProcessor,
    RecurringJournalProcessor,
    RecurringInvoiceProcessor,
    CurrencyConversionService,
    BankReconciliationService,
    PaymentBatchService,
  ],
  exports: [
    FinanceService,
    CurrencyConversionService,
    BankReconciliationService,
    PaymentBatchService,
  ],
})
export class FinanceModule {}
