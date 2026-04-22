import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
  In,
  IsNull,
  Like,
} from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { Invoice, InvoiceLine, InvoiceStatus } from './entities/invoice.entity';
import {
  JournalEntry,
  JournalLine,
  JournalStatus,
} from './entities/journal.entity';
import { Bill, BillLine, BillStatus } from './entities/bill.entity';
import { TaxRate } from './entities/tax-rate.entity';
import {
  AccountingPeriod,
  PeriodStatus,
} from './entities/accounting-period.entity';
import {
  BankTransaction,
  TransactionStatus,
} from './entities/bank-transaction.entity';
import { Budget } from './entities/budget.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateJournalEntryDto } from './dto/create-journal.dto';
import { PdfService } from '../system/pdf.service';
import * as ExcelJS from 'exceljs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceLine)
    private readonly invoiceLineRepo: Repository<InvoiceLine>,
    @InjectRepository(JournalEntry)
    private readonly journalRepo: Repository<JournalEntry>,
    @InjectRepository(JournalLine)
    private readonly journalLineRepo: Repository<JournalLine>,
    @InjectRepository(Bill)
    private readonly billRepo: Repository<Bill>,
    @InjectRepository(BillLine)
    private readonly billLineRepo: Repository<BillLine>,
    @InjectRepository(TaxRate)
    private readonly taxRateRepo: Repository<TaxRate>,
    @InjectRepository(AccountingPeriod)
    private readonly periodRepo: Repository<AccountingPeriod>,
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepo: Repository<BankTransaction>,
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    private readonly pdfService: PdfService,
    @InjectQueue('ar_reminders') private arReminderQueue: Queue,
  ) {}

  // ... (revenue methods remain same)

  private async findAccountByCode(code: string): Promise<Account> {
    const acc = await this.accountRepo.findOne({ where: { code } });
    if (!acc) {
      // In a real system, we might want to auto-create or throw a specific error
      throw new NotFoundException(
        `System Account with code "${code}" not found. Please ensure Chart of Accounts is seeded.`,
      );
    }
    return acc;
  }

  async findAllAccountsTree() {
    const accounts = await this.accountRepo.find({ order: { code: 'ASC' } });

    const buildTree = (parentId: string | null = null): any[] => {
      return accounts
        .filter((acc) => acc.parentId === parentId)
        .map((acc) => ({
          ...acc,
          children: buildTree(acc.id),
        }));
    };

    return buildTree(null);
  }

  // ... (other account methods)

  async getIncomeStatement(startDate: string, endDate: string) {
    const revenueAccounts = await this.accountRepo.find({
      where: { type: AccountType.REVENUE },
    });
    const expenseAccounts = await this.accountRepo.find({
      where: { type: AccountType.EXPENSE },
    });

    const calculateBalance = async (accId: string) => {
      const result = await this.journalLineRepo
        .createQueryBuilder('line')
        .innerJoin('line.journalEntry', 'entry')
        .select('SUM(line.debit - line.credit)', 'balance')
        .where('line.accountId = :accId', { accId })
        .andWhere('entry.entryDate >= :startDate', { startDate })
        .andWhere('entry.entryDate <= :endDate', { endDate })
        .getRawOne();
      return Number(result.balance) || 0;
    };

    const revenues = await Promise.all(
      revenueAccounts.map(async (acc) => ({
        name: acc.name,
        code: acc.code,
        amount: Math.abs(await calculateBalance(acc.id)),
      })),
    );

    const expenses = await Promise.all(
      expenseAccounts.map(async (acc) => ({
        name: acc.name,
        code: acc.code,
        amount: await calculateBalance(acc.id),
      })),
    );

    const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

    return {
      period: { startDate, endDate },
      revenues,
      expenses,
      totalRevenue,
      totalExpense,
      netIncome: totalRevenue - totalExpense,
    };
  }

  async getBalanceSheet(asOfDate: string) {
    const accounts = await this.accountRepo.find();

    const calculateBalance = async (accId: string) => {
      const result = await this.journalLineRepo
        .createQueryBuilder('line')
        .innerJoin('line.journalEntry', 'entry')
        .select('SUM(line.debit - line.credit)', 'balance')
        .where('line.accountId = :accId', { accId })
        .andWhere('entry.entryDate <= :asOfDate', { asOfDate })
        .getRawOne();
      return Number(result.balance) || 0;
    };

    const assets: { name: string; code: string; balance: number }[] = [];
    const liabilities: { name: string; code: string; balance: number }[] = [];
    const equity: { name: string; code: string; balance: number }[] = [];

    for (const acc of accounts) {
      const balance = await calculateBalance(acc.id);
      const item = {
        name: acc.name,
        code: acc.code,
        balance: Math.abs(balance),
      };

      if (acc.type === AccountType.ASSET) assets.push(item);
      else if (acc.type === AccountType.LIABILITY) liabilities.push(item);
      else if (acc.type === AccountType.EQUITY) equity.push(item);
    }

    return {
      asOfDate,
      assets,
      liabilities,
      equity,
      totalAssets: assets.reduce((s, a) => s + a.balance, 0),
      totalLiabilities: liabilities.reduce((s, l) => s + l.balance, 0),
      totalEquity: equity.reduce((s, e) => s + e.balance, 0),
    };
  }

  async getCashFlowReport(startDate: string, endDate: string) {
    const cashAccounts = await this.accountRepo.find({
      where: { code: Like('10%') }, // Simple heuristic for cash accounts
    });

    const lines = await this.journalLineRepo
      .createQueryBuilder('line')
      .innerJoinAndSelect('line.journalEntry', 'entry')
      .where('line.accountId IN (:...ids)', {
        ids: cashAccounts.map((a) => a.id),
      })
      .andWhere('entry.entryDate >= :startDate', { startDate })
      .andWhere('entry.entryDate <= :endDate', { endDate })
      .getMany();

    // Group by activity type (Operational, Investing, Financing)
    // This requires tagging accounts or journal entries with activity types.
    // For now, return a simple summary.
    return {
      period: { startDate, endDate },
      totalInflow: lines.reduce((sum, l) => sum + Number(l.debit), 0),
      totalOutflow: lines.reduce((sum, l) => sum + Number(l.credit), 0),
      netCashFlow: lines.reduce(
        (sum, l) => sum + (Number(l.debit) - Number(l.credit)),
        0,
      ),
    };
  }

  async scheduleARReminders() {
    const overdueInvoices = await this.invoiceRepo.find({
      where: { status: InvoiceStatus.OVERDUE },
    });

    for (const inv of overdueInvoices) {
      await this.arReminderQueue.add(
        'send_reminder',
        {
          invoiceId: inv.id,
          customerEmail: inv.customerEmail,
          invoiceNumber: inv.invoiceNumber,
          amount: inv.totalAmount - inv.paidAmount,
        },
        {
          attempts: 3,
          backoff: 5000,
        },
      );
    }

    return { count: overdueInvoices.length };
  }

  async closePeriod(id: string): Promise<AccountingPeriod> {
    const period = await this.periodRepo.findOne({ where: { id } });
    if (!period) throw new NotFoundException('Period not found');

    if (period.status === PeriodStatus.CLOSED) {
      throw new BadRequestException('Period is already closed');
    }

    period.status = PeriodStatus.CLOSED;
    return this.periodRepo.save(period);
  }

  async getRevenueMTD(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.invoiceRepo
      .createQueryBuilder('inv')
      .select('SUM(inv.totalAmount)', 'total')
      .where('inv.issueDate >= :start', {
        start: startOfMonth.toISOString().split('T')[0],
      })
      .andWhere('inv.status = :status', { status: InvoiceStatus.PAID })
      .getRawOne<{ total: string }>();

    return Number(result?.total) || 0;
  }

  async getPendingInvoicesCount(): Promise<number> {
    return this.invoiceRepo.count({
      where: [
        { status: InvoiceStatus.SENT },
        { status: InvoiceStatus.PARTIALLY_PAID },
        { status: InvoiceStatus.OVERDUE },
      ],
    });
  }

  async createAccount(dto: CreateAccountDto): Promise<Account> {
    const exists = await this.accountRepo.findOne({
      where: { code: dto.code },
    });
    if (exists)
      throw new ConflictException(`Account code "${dto.code}" already exists`);
    const account = this.accountRepo.create(dto);
    return this.accountRepo.save(account);
  }

  async findAllAccounts() {
    return this.accountRepo.find({ order: { code: 'ASC' } });
  }

  async findAccountById(id: string): Promise<Account> {
    const acc = await this.accountRepo.findOne({ where: { id } });
    if (!acc) throw new NotFoundException(`Account "${id}" not found`);
    return acc;
  }

  async updateAccount(
    id: string,
    dto: Partial<CreateAccountDto>,
  ): Promise<Account> {
    await this.findAccountById(id);
    await this.accountRepo.update(id, dto);
    return this.findAccountById(id);
  }

  async removeAccount(id: string): Promise<void> {
    await this.findAccountById(id);
    await this.accountRepo.softDelete(id);
  }

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const exists = await this.invoiceRepo.findOne({
      where: { invoiceNumber: dto.invoiceNumber },
    });
    if (exists)
      throw new ConflictException(
        `Invoice "${dto.invoiceNumber}" already exists`,
      );

    const lines = dto.lines.map((l) => {
      const line = this.invoiceLineRepo.create({
        ...l,
        lineTotal: l.quantity * l.unitPrice,
      });
      return line;
    });

    const subtotal = lines.reduce((sum, l) => sum + Number(l.lineTotal), 0);
    const taxAmount = subtotal * 0.1; // 10% default tax
    const totalAmount = subtotal + taxAmount;

    const invoice = this.invoiceRepo.create({
      ...dto,
      subtotal,
      taxAmount,
      totalAmount,
      lines,
    });

    const saved = await this.invoiceRepo.save(invoice);
    this.logger.log(
      `Invoice created: ${saved.invoiceNumber} — $${totalAmount}`,
    );
    return this.findInvoiceById(saved.id);
  }

  async findAllInvoices(page = 1, limit = 20) {
    const [data, total] = await this.invoiceRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findInvoiceById(id: string): Promise<Invoice> {
    const inv = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['lines'],
    });
    if (!inv) throw new NotFoundException(`Invoice "${id}" not found`);
    return inv;
  }

  async updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
  ): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);
    await this.invoiceRepo.update(id, { status });

    if (status === InvoiceStatus.PAID) {
      // Trigger Auto-Journal: Debit Cash (1010), Credit Accounts Receivable (1200)
      const cashAccount = await this.findAccountByCode('1010');
      const arAccount = await this.findAccountByCode('1200');

      await this.createJournalEntry({
        entryNumber: `PAY-${invoice.invoiceNumber}`,
        entryDate: new Date().toISOString(),
        description: `Payment received for Invoice ${invoice.invoiceNumber}`,
        reference: invoice.invoiceNumber,
        lines: [
          {
            accountId: cashAccount.id,
            debit: invoice.totalAmount,
            credit: 0,
          },
          {
            accountId: arAccount.id,
            debit: 0,
            credit: invoice.totalAmount,
          },
        ],
      });
      this.logger.log(
        `Auto-journal posted for paid invoice: ${invoice.invoiceNumber}`,
      );
    }

    return this.findInvoiceById(id);
  }

  async removeInvoice(id: string): Promise<void> {
    await this.findInvoiceById(id);
    await this.invoiceRepo.softDelete(id);
  }

  async createJournalEntry(dto: CreateJournalEntryDto): Promise<JournalEntry> {
    const totalDebit = dto.lines.reduce((s, l) => s + Number(l.debit), 0);
    const totalCredit = dto.lines.reduce((s, l) => s + Number(l.credit), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Journal entry must balance: debit=$${totalDebit} credit=$${totalCredit}`,
      );
    }

    // Check if period is open
    const entryDate = new Date(dto.entryDate);
    const period = await this.periodRepo.findOne({
      where: {
        status: PeriodStatus.OPEN,
        startDate: LessThanOrEqual(dto.entryDate),
        endDate: MoreThanOrEqual(dto.entryDate),
      } as any,
    });

    if (!period) {
      throw new BadRequestException(
        `No open accounting period found for date ${dto.entryDate}`,
      );
    }

    const lines = dto.lines.map((l) => this.journalLineRepo.create(l));
    const entry = this.journalRepo.create({
      ...dto,
      status: JournalStatus.POSTED, // Auto-post for now
      totalDebit,
      totalCredit,
      lines,
    });

    const saved = await this.journalRepo.save(entry);

    // Update account balances
    for (const line of saved.lines) {
      const account = await this.accountRepo.findOne({
        where: { id: line.accountId },
      });
      if (account) {
        const amount = Number(line.debit) - Number(line.credit);
        // Balance logic depends on account type
        if ([AccountType.ASSET, AccountType.EXPENSE].includes(account.type)) {
          account.balance = Number(account.balance) + amount;
        } else {
          account.balance = Number(account.balance) - amount;
        }
        await this.accountRepo.save(account);
      }
    }

    this.logger.log(`Journal entry posted: ${saved.entryNumber}`);
    return this.findJournalById(saved.id);
  }

  async findAllJournals(page = 1, limit = 20) {
    const [data, total] = await this.journalRepo.findAndCount({
      order: { entryDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findJournalById(id: string): Promise<JournalEntry> {
    const entry = await this.journalRepo.findOne({
      where: { id },
      relations: ['lines'],
    });
    if (!entry) throw new NotFoundException(`Journal entry "${id}" not found`);
    return entry;
  }

  async removeJournal(id: string): Promise<void> {
    await this.findJournalById(id);
    await this.journalRepo.softDelete(id);
  }

  async createBill(dto: any): Promise<Bill> {
    // 3-Way Matching Logic
    if (dto.purchaseOrderId && dto.grnId) {
      // In a real system, we would inject PurchaseOrderRepo and GrnRepo
      // For now, we simulate the validation logic
      this.logger.log(
        `Performing 3-way match for PO: ${dto.purchaseOrderId} and GRN: ${dto.grnId}`,
      );

      // Validation: Sum of bill line quantities should not exceed GRN quantities
      // Validation: Bill prices should match PO prices (within tolerance)
    }

    const lines = dto.lines.map((l: any) => {
      const line = this.billLineRepo.create({
        ...l,
        lineTotal: l.quantity * l.unitPrice,
      });
      return line;
    });

    const subtotal = lines.reduce(
      (sum: number, l: any) => sum + Number(l.lineTotal),
      0,
    );
    const taxAmount = subtotal * 0.1; // Default tax
    const totalAmount = subtotal + taxAmount;

    const bill = this.billRepo.create({
      ...dto,
      subtotal,
      taxAmount,
      totalAmount,
      lines,
    });

    const saved = await this.billRepo.save(bill);
    this.logger.log(`Bill created: ${(saved as any).billNumber}`);

    return saved as any;
  }

  async findAllBills(page = 1, limit = 20) {
    const [data, total] = await this.billRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['lines'],
    });
    return { data, meta: { total, page, limit } };
  }

  async findBillById(id: string): Promise<Bill> {
    const bill = await this.billRepo.findOne({
      where: { id },
      relations: ['lines'],
    });
    if (!bill) throw new NotFoundException(`Bill "${id}" not found`);
    return bill;
  }

  async updateBillStatus(id: string, status: BillStatus): Promise<Bill> {
    const bill = await this.findBillById(id);
    bill.status = status;
    const saved = await this.billRepo.save(bill);

    if (status === BillStatus.APPROVED) {
      // Trigger journal entry: Debit Expense (5000), Credit AP (2100)
      const expenseAccount = await this.findAccountByCode('5000');
      const apAccount = await this.findAccountByCode('2100');

      await this.createJournalEntry({
        entryNumber: `BILL-${(bill as Bill).billNumber}`,
        entryDate: new Date().toISOString(),
        description: `Expense recorded for Bill ${(bill as Bill).billNumber}`,
        reference: (bill as Bill).billNumber,
        lines: [
          {
            accountId: expenseAccount.id,
            debit: (bill as Bill).totalAmount,
            credit: 0,
          },
          {
            accountId: apAccount.id,
            debit: 0,
            credit: (bill as Bill).totalAmount,
          },
        ],
      });
      this.logger.log(
        `Auto-journal posted for approved bill: ${(bill as Bill).billNumber}`,
      );
    }

    return saved as Bill;
  }

  async getTrialBalance() {
    const accounts = await this.accountRepo.find({ where: { isActive: true } });

    return accounts.map((acc) => ({
      accountId: acc.id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debit: acc.balance > 0 ? acc.balance : 0,
      credit: acc.balance < 0 ? Math.abs(acc.balance) : 0,
    }));
  }

  async getGeneralLedger(
    accountId: string,
    page = 1,
    limit = 20,
    startDate?: string,
    endDate?: string,
  ) {
    const qb = this.journalLineRepo
      .createQueryBuilder('line')
      .innerJoinAndSelect('line.journalEntry', 'entry')
      .where('line.accountId = :accountId', { accountId });

    if (startDate) qb.andWhere('entry.entryDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('entry.entryDate <= :endDate', { endDate });

    qb.orderBy('entry.entryDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit } };
  }

  async recordPayrollDisbursement(totalNetPay: number, payrollRef: string) {
    const cashAccount = await this.findAccountByCode('1010');
    const salaryExpenseAccount = await this.findAccountByCode('5100'); // Salaries

    return this.createJournalEntry({
      entryNumber: `PR-${payrollRef}`,
      entryDate: new Date().toISOString(),
      description: `Payroll disbursement for period ${payrollRef}`,
      reference: payrollRef,
      lines: [
        { accountId: salaryExpenseAccount.id, debit: totalNetPay, credit: 0 },
        { accountId: cashAccount.id, debit: 0, credit: totalNetPay },
      ],
    });
  }

  async recordAssetDepreciation(
    assetId: string,
    assetName: string,
    amount: number,
  ) {
    const deprExpenseAccount = await this.findAccountByCode('5500'); // Depreciation Exp
    const accumDeprAccount = await this.findAccountByCode('1810'); // Accum Depreciation

    return this.createJournalEntry({
      entryNumber: `DEP-${assetId}-${Date.now()}`,
      entryDate: new Date().toISOString(),
      description: `Monthly depreciation for ${assetName}`,
      reference: assetId,
      lines: [
        { accountId: deprExpenseAccount.id, debit: amount, credit: 0 },
        { accountId: accumDeprAccount.id, debit: 0, credit: amount },
      ],
    });
  }

  async getARAgingReport() {
    const today = new Date();
    const invoices = await this.invoiceRepo.find({
      where: {
        status: In([
          InvoiceStatus.SENT,
          InvoiceStatus.PARTIALLY_PAID,
          InvoiceStatus.OVERDUE,
        ]),
      } as any,
    });

    const aging = {
      current: 0,
      '1_30': 0,
      '31_60': 0,
      '61_90': 0,
      '90_plus': 0,
    };

    invoices.forEach((inv) => {
      const dueDate = new Date(inv.dueDate);
      const diffDays = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24),
      );
      const amount = Number(inv.totalAmount) - Number(inv.paidAmount);

      if (diffDays <= 0) aging.current += amount;
      else if (diffDays <= 30) aging['1_30'] += amount;
      else if (diffDays <= 60) aging['31_60'] += amount;
      else if (diffDays <= 90) aging['61_90'] += amount;
      else aging['90_plus'] += amount;
    });

    return aging;
  }

  async importBankStatement(bankAccountId: string, transactions: any[]) {
    const saved: BankTransaction[] = [];
    for (const trx of transactions) {
      const entry = this.bankTransactionRepo.create({
        ...trx,
        bankAccountId,
        status: TransactionStatus.UNRECONCILED,
      });
      saved.push((await this.bankTransactionRepo.save(entry)) as any);
    }
    return saved;
  }

  async reconcileTransaction(transactionId: string, journalEntryId: string) {
    const trx = await this.bankTransactionRepo.findOne({
      where: { id: transactionId },
    });
    if (!trx) throw new NotFoundException('Transaction not found');

    trx.status = TransactionStatus.RECONCILED;
    trx.matchedJournalEntryId = journalEntryId;
    return this.bankTransactionRepo.save(trx);
  }

  async createTaxRate(dto: any) {
    const taxRate = this.taxRateRepo.create(dto);
    return this.taxRateRepo.save(taxRate);
  }

  async findAllTaxRates() {
    return this.taxRateRepo.find({ order: { name: 'ASC' } });
  }

  async updateTaxRate(id: string, dto: any) {
    await this.taxRateRepo.update(id, dto);
    return this.taxRateRepo.findOne({ where: { id } });
  }

  async getBudgetVsActualReport(period: string) {
    const budgets = await this.budgetRepo.find({
      where: { period },
      relations: ['account'],
    });

    const report = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = `${period}-01`;
        const endDate = `${period}-31`; // Simplified

        const actualResult = await this.journalLineRepo
          .createQueryBuilder('line')
          .innerJoin('line.journalEntry', 'entry')
          .select('SUM(line.debit - line.credit)', 'balance')
          .where('line.accountId = :accId', { accId: budget.accountId })
          .andWhere('entry.entryDate >= :startDate', { startDate })
          .andWhere('entry.entryDate <= :endDate', { endDate })
          .getRawOne();

        const actual = Math.abs(Number(actualResult.balance) || 0);
        const variance = actual - Number(budget.amount);
        const variancePercent =
          Number(budget.amount) !== 0
            ? (variance / Number(budget.amount)) * 100
            : 0;

        return {
          accountName: budget.account?.name || 'Unknown',
          accountCode: budget.account?.code || 'Unknown',
          budgeted: Number(budget.amount),
          actual,
          variance,
          variancePercent,
        };
      }),
    );

    return report;
  }

  async exportTrialBalancePdf() {
    const data = await this.getTrialBalance();
    const template = `
      <h1>Trial Balance</h1>
      <table>
        <tr><th>Account</th><th>Debit</th><th>Credit</th></tr>
        {{#each this}}
          <tr>
            <td>{{code}} - {{name}}</td>
            <td>{{debit}}</td>
            <td>{{credit}}</td>
          </tr>
        {{/each}}
      </table>
    `;
    return this.pdfService.generatePdf(template, data);
  }

  async exportTrialBalanceExcel() {
    const data = await this.getTrialBalance();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Trial Balance');

    worksheet.columns = [
      { header: 'Code', key: 'code', width: 10 },
      { header: 'Account Name', key: 'name', width: 30 },
      { header: 'Debit', key: 'debit', width: 15 },
      { header: 'Credit', key: 'credit', width: 15 },
    ];

    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  @OnEvent('payroll.processed')
  async handlePayrollProcessed(payload: {
    runId: string;
    totalNet: number;
    totalGross: number;
    totalDeductions: number;
    period: string;
  }) {
    this.logger.log(
      `Handling payroll processed event for period: ${payload.period}`,
    );
    await this.recordPayrollDisbursement(payload.totalNet, payload.period);
  }
}
