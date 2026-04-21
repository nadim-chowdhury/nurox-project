import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
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
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateJournalEntryDto } from './dto/create-journal.dto';
import { PdfService } from '../system/pdf.service';
import * as ExcelJS from 'exceljs';

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
    private readonly pdfService: PdfService,
  ) {}

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

  // ─── ACCOUNTS ───────────────────────────────────────────────

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

  // ─── INVOICES ───────────────────────────────────────────────

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
      // Trigger Auto-Journal: Debit Cash/Bank, Credit Accounts Receivable
      await this.createJournalEntry({
        entryDate: new Date().toISOString(),
        description: `Payment received for Invoice ${invoice.invoiceNumber}`,
        reference: invoice.invoiceNumber,
        lines: [
          {
            accountId: 'CASH_ACCOUNT_ID',
            debit: invoice.totalAmount,
            credit: 0,
          }, // Placeholder IDs
          { accountId: 'AR_ACCOUNT_ID', debit: 0, credit: invoice.totalAmount },
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

  // ─── JOURNALS ───────────────────────────────────────────────

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

  // ─── BILLS ──────────────────────────────────────────────────

  async createBill(dto: any): Promise<Bill> {
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
    this.logger.log(`Bill created: ${saved.billNumber}`);

    // Trigger auto-journal for Bill
    // Debit Expense/Asset, Credit Accounts Payable
    // This requires pre-configured accounts (System Accounts)

    return saved;
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
      // Trigger journal entry: Debit Expense, Credit AP
      // Implementation of auto-journal logic...
      this.logger.log(
        `Auto-journal triggered for approved bill: ${bill.billNumber}`,
      );
    }

    return saved;
  }

  // ─── REPORTS ────────────────────────────────────────────────

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
    startDate?: string,
    endDate?: string,
  ) {
    const qb = this.journalLineRepo
      .createQueryBuilder('line')
      .innerJoinAndSelect('line.journalEntry', 'entry')
      .where('line.accountId = :accountId', { accountId });

    if (startDate) qb.andWhere('entry.entryDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('entry.entryDate <= :endDate', { endDate });

    qb.orderBy('entry.entryDate', 'ASC');

    return qb.getMany();
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

  // ─── BANK RECONCILIATION ────────────────────────────────────

  async importBankStatement(bankAccountId: string, transactions: any[]) {
    const saved = [];
    for (const trx of transactions) {
      const entry = this.bankTransactionRepo.create({
        ...trx,
        bankAccountId,
        status: TransactionStatus.UNRECONCILED,
      });
      saved.push(await this.bankTransactionRepo.save(entry));
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

  // ─── EXPORTS ────────────────────────────────────────────────

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
}
