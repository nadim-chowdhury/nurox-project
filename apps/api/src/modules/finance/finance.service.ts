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
  Like,
  DataSource,
  EntityManager,
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
import { BankAccount } from './entities/bank-account.entity';
import { Budget } from './entities/budget.entity';
import { RecurringInvoice } from './entities/recurring-invoice.entity';
import { CreditNote } from './entities/credit-note.entity';
import {
  ExpenseClaim,
  ExpenseClaimStatus,
} from './entities/expense-claim.entity';
import {
  PettyCashFund,
  PettyCashTransaction,
  PettyCashType,
} from './entities/petty-cash.entity';
import { Grn as GRN } from '../procurement/entities/grn.entity';
import { PurchaseOrder } from '../procurement/entities/purchase-order.entity';
import { Tenant } from '../system/entities/tenant.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateJournalEntryDto } from './dto/create-journal.dto';
import { PdfService } from '../system/pdf.service';
import { INVOICE_TEMPLATE } from './templates/invoice.template';
import { CurrencyConversionService } from './currency-conversion.service';
import { ClsService } from 'nestjs-cls';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';
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
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(CreditNote)
    private readonly creditNoteRepo: Repository<CreditNote>,
    @InjectRepository(RecurringInvoice)
    private readonly recurringRepo: Repository<RecurringInvoice>,
    @InjectRepository(ExpenseClaim)
    private readonly expenseClaimRepo: Repository<ExpenseClaim>,
    @InjectRepository(PettyCashFund)
    private readonly pettyCashFundRepo: Repository<PettyCashFund>,
    @InjectRepository(PettyCashTransaction)
    private readonly pettyCashTransactionRepo: Repository<PettyCashTransaction>,
    @InjectRepository(GRN)
    private readonly grnRepo: Repository<GRN>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    private readonly pdfService: PdfService,
    private readonly currencyService: CurrencyConversionService,
    private readonly cls: ClsService,
    private readonly dataSource: DataSource,
    @InjectQueue('ar_reminders') private arReminderQueue: Queue,
  ) {}

  private get tenantId(): string {
    return this.cls.get('tenantId');
  }

  private async findAccountByCode(code: string): Promise<Account> {
    const acc = await this.accountRepo.findOne({
      where: { code, tenantId: this.tenantId },
    });
    if (!acc) {
      throw new NotFoundException(
        `System Account with code "${code}" not found. Please ensure Chart of Accounts is seeded.`,
      );
    }
    return acc;
  }

  async findAllAccountsTree() {
    const accounts = await this.accountRepo.find({
      where: { tenantId: this.tenantId },
      order: { code: 'ASC' },
    });

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

  private async validateParentAccount(
    parentId: string,
    currentAccountId?: string,
  ) {
    if (parentId === currentAccountId) {
      throw new BadRequestException('An account cannot be its own parent');
    }

    const parent = await this.accountRepo.findOne({
      where: { id: parentId, tenantId: this.tenantId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent account "${parentId}" not found`);
    }

    // Circularity check
    if (currentAccountId) {
      let nextParentId = parent.parentId;
      while (nextParentId) {
        if (nextParentId === currentAccountId) {
          throw new BadRequestException(
            'Circular dependency detected in Chart of Accounts',
          );
        }
        const nextParent = await this.accountRepo.findOne({
          where: { id: nextParentId, tenantId: this.tenantId },
        });
        nextParentId = nextParent?.parentId ?? null;
      }
    }
  }

  async createAccount(dto: CreateAccountDto): Promise<Account> {
    const exists = await this.accountRepo.findOne({
      where: { code: dto.code, tenantId: this.tenantId },
    });
    if (exists)
      throw new ConflictException(`Account code "${dto.code}" already exists`);

    if (dto.parentId) {
      await this.validateParentAccount(dto.parentId);
    }

    const account = this.accountRepo.create({
      ...dto,
      tenantId: this.tenantId,
    });
    return this.accountRepo.save(account);
  }

  async findAllAccounts() {
    return this.accountRepo.find({
      where: { tenantId: this.tenantId },
      order: { code: 'ASC' },
    });
  }

  async findAccountById(id: string): Promise<Account> {
    const acc = await this.accountRepo.findOne({
      where: { id, tenantId: this.tenantId },
    });
    if (!acc) throw new NotFoundException(`Account "${id}" not found`);
    return acc;
  }

  async updateAccount(
    id: string,
    dto: Partial<CreateAccountDto>,
  ): Promise<Account> {
    await this.findAccountById(id);

    if (dto.parentId) {
      await this.validateParentAccount(dto.parentId, id);
    }

    await this.accountRepo.update({ id, tenantId: this.tenantId }, dto);
    return this.findAccountById(id);
  }

  async removeAccount(id: string): Promise<void> {
    await this.findAccountById(id);
    await this.accountRepo.softDelete({ id, tenantId: this.tenantId });
  }

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const exists = await this.invoiceRepo.findOne({
      where: { invoiceNumber: dto.invoiceNumber, tenantId: this.tenantId },
    });
    if (exists)
      throw new ConflictException(
        `Invoice "${dto.invoiceNumber}" already exists`,
      );

    let totalTax = 0;
    const lines = await Promise.all(
      dto.lines.map(async (l) => {
        let lineTax = 0;
        if (l.taxRateId) {
          const taxRate = await this.taxRateRepo.findOneBy({
            id: l.taxRateId,
            tenantId: this.tenantId,
          });
          if (taxRate) {
            lineTax = l.quantity * l.unitPrice * (Number(taxRate.rate) / 100);
          }
        }
        totalTax += lineTax;
        return this.invoiceLineRepo.create({
          ...l,
          tenantId: this.tenantId,
          lineTotal: l.quantity * l.unitPrice,
        });
      }),
    );

    const subtotal = lines.reduce((sum, l) => sum + Number(l.lineTotal), 0);
    const totalAmount = subtotal + totalTax;

    const invoice = this.invoiceRepo.create({
      ...dto,
      tenantId: this.tenantId,
      subtotal,
      taxAmount: totalTax,
      totalAmount,
      lines,
      status: dto.isProforma
        ? InvoiceStatus.PROFORMA
        : dto.status || InvoiceStatus.DRAFT,
    });

    const saved = await this.invoiceRepo.save(invoice);
    this.logger.log(
      `Invoice created: ${saved.invoiceNumber} — $${totalAmount} (Proforma: ${saved.isProforma})`,
    );
    return this.findInvoiceById(saved.id);
  }

  async convertProformaToInvoice(id: string): Promise<Invoice> {
    const proforma = await this.findInvoiceById(id);
    if (!proforma.isProforma) {
      throw new BadRequestException('Invoice is not a proforma');
    }

    proforma.isProforma = false;
    proforma.status = InvoiceStatus.SENT;
    proforma.issueDate = new Date().toISOString().split('T')[0];

    // Logic for new invoice number if needed, for now we keep it or prefix it
    // proforma.invoiceNumber = proforma.invoiceNumber.replace('PRO-', 'INV-');

    return this.invoiceRepo.save(proforma);
  }

  async findAllInvoices(page = 1, limit = 20) {
    const [data, total] = await this.invoiceRepo.findAndCount({
      where: { tenantId: this.tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['lines'],
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findInvoiceById(id: string): Promise<Invoice> {
    const inv = await this.invoiceRepo.findOne({
      where: { id, tenantId: this.tenantId },
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
    const oldStatus = invoice.status;
    await this.invoiceRepo.update({ id, tenantId: this.tenantId }, { status });

    if (status === InvoiceStatus.SENT && oldStatus === InvoiceStatus.DRAFT) {
      // Trigger auto-journal: Debit AR (1100), Credit Revenue (4000)
      const arAccount = await this.findAccountByCode('1100');
      const revenueAccount = await this.findAccountByCode('4000');

      await this.createJournalEntry({
        entryNumber: `INV-${invoice.invoiceNumber}`,
        entryDate: invoice.issueDate,
        description: `Sales recorded for Invoice ${invoice.invoiceNumber}`,
        reference: invoice.invoiceNumber,
        lines: [
          { accountId: arAccount.id, debit: invoice.totalAmount, credit: 0 },
          {
            accountId: revenueAccount.id,
            debit: 0,
            credit: invoice.totalAmount,
          },
        ],
      });
      this.logger.log(
        `Auto-journal posted for sent invoice: ${invoice.invoiceNumber}`,
      );
    }

    if (status === InvoiceStatus.PAID) {
      // Logic handled in recordPayment or manual trigger
      // If manually updated to PAID, we might want to ensure a payment record exists
    }

    return this.findInvoiceById(id);
  }

  async removeInvoice(id: string): Promise<void> {
    await this.findInvoiceById(id);
    await this.invoiceRepo.softDelete({ id, tenantId: this.tenantId });
  }

  async createRecurringInvoice(dto: any): Promise<RecurringInvoice> {
    const ri = this.recurringRepo.create({
      ...dto,
      tenantId: this.tenantId,
      nextRunDate: dto.startDate,
    });
    return (await this.recurringRepo.save(ri)) as unknown as RecurringInvoice;
  }

  async findAllRecurringInvoices() {
    return this.recurringRepo.find({
      where: { tenantId: this.tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findRecurringInvoiceById(id: string): Promise<RecurringInvoice> {
    const ri = await this.recurringRepo.findOne({
      where: { id, tenantId: this.tenantId },
    });
    if (!ri) throw new NotFoundException(`Recurring Invoice "${id}" not found`);
    return ri;
  }

  async updateRecurringInvoice(
    id: string,
    dto: any,
  ): Promise<RecurringInvoice> {
    await this.findRecurringInvoiceById(id);
    await this.recurringRepo.update({ id, tenantId: this.tenantId }, dto);
    return this.findRecurringInvoiceById(id);
  }

  async removeRecurringInvoice(id: string): Promise<void> {
    await this.findRecurringInvoiceById(id);
    await this.recurringRepo.softDelete({ id, tenantId: this.tenantId });
  }

  async createExpenseClaim(dto: any): Promise<ExpenseClaim> {
    const claim = this.expenseClaimRepo.create({
      ...dto,
      tenantId: this.tenantId,
    });
    return (await this.expenseClaimRepo.save(claim)) as unknown as ExpenseClaim;
  }

  async findAllExpenseClaims() {
    return this.expenseClaimRepo.find({
      where: { tenantId: this.tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findExpenseClaimById(id: string): Promise<ExpenseClaim> {
    const claim = await this.expenseClaimRepo.findOne({
      where: { id, tenantId: this.tenantId },
    });
    if (!claim) throw new NotFoundException(`Expense Claim "${id}" not found`);
    return claim;
  }

  async approveExpenseClaim(
    id: string,
    approverId: string,
  ): Promise<ExpenseClaim> {
    const claim = await this.findExpenseClaimById(id);
    claim.status = ExpenseClaimStatus.APPROVED;
    claim.approvedAt = new Date();
    claim.approverId = approverId;
    return (await this.expenseClaimRepo.save(claim)) as unknown as ExpenseClaim;
  }

  async rejectExpenseClaim(id: string, reason: string): Promise<ExpenseClaim> {
    const claim = await this.findExpenseClaimById(id);
    claim.status = ExpenseClaimStatus.REJECTED;
    claim.rejectionReason = reason;
    return (await this.expenseClaimRepo.save(claim)) as unknown as ExpenseClaim;
  }

  async payExpenseClaim(id: string): Promise<ExpenseClaim> {
    const claim = await this.findExpenseClaimById(id);
    if (claim.status !== ExpenseClaimStatus.APPROVED) {
      throw new BadRequestException('Only approved claims can be paid');
    }

    if (!claim.reimburseViaPayroll) {
      // Trigger journal entry: Debit Expense (5000), Credit Cash (1010)
      const expenseAccount = await this.findAccountByCode('5000');
      const cashAccount = await this.findAccountByCode('1010');

      const journal = await this.createJournalEntry({
        entryNumber: `EXP-${claim.id}-${Date.now()}`,
        entryDate: new Date().toISOString().split('T')[0],
        description: `Expense reimbursement for ${claim.employeeName}: ${claim.description}`,
        lines: [
          { accountId: expenseAccount.id, debit: claim.amount, credit: 0 },
          { accountId: cashAccount.id, debit: 0, credit: claim.amount },
        ],
      } as any);

      claim.paymentJournalEntryId = journal.id;
    }

    claim.status = ExpenseClaimStatus.PAID;
    return (await this.expenseClaimRepo.save(claim)) as unknown as ExpenseClaim;
  }

  async createPettyCashFund(dto: any): Promise<PettyCashFund> {
    const fund = this.pettyCashFundRepo.create({
      ...dto,
      tenantId: this.tenantId,
    });
    const saved = (await this.pettyCashFundRepo.save(
      fund,
    )) as unknown as PettyCashFund;

    if (Number(saved.balance) > 0) {
      await this.recordPettyCashTransaction({
        fundId: saved.id,
        transactionDate: new Date().toISOString().split('T')[0],
        type: PettyCashType.OPENING_BALANCE,
        description: 'Opening balance',
        amount: saved.balance,
      });
    }

    return saved;
  }

  async findAllPettyCashFunds() {
    return this.pettyCashFundRepo.find({ where: { tenantId: this.tenantId } });
  }

  async recordPettyCashTransaction(dto: {
    fundId: string;
    transactionDate: string;
    type: PettyCashType;
    description: string;
    amount: number;
    reference?: string;
  }): Promise<PettyCashTransaction> {
    const fund = await this.pettyCashFundRepo.findOne({
      where: { id: dto.fundId, tenantId: this.tenantId },
    });
    if (!fund) throw new NotFoundException('Petty cash fund not found');

    let newBalance = Number(fund.balance);
    if (dto.type === PettyCashType.DISBURSEMENT) {
      newBalance -= Number(dto.amount);
    } else {
      newBalance += Number(dto.amount);
    }

    if (newBalance < 0) {
      throw new BadRequestException('Insufficient balance in petty cash fund');
    }

    const transaction = this.pettyCashTransactionRepo.create({
      ...dto,
      tenantId: this.tenantId,
      runningBalance: newBalance,
    } as any);

    const saved = (await this.pettyCashTransactionRepo.save(
      transaction,
    )) as unknown as PettyCashTransaction;
    fund.balance = newBalance;
    await this.pettyCashFundRepo.save(fund);

    return saved;
  }

  async findPettyCashTransactions(fundId: string) {
    return this.pettyCashTransactionRepo.find({
      where: { fundId, tenantId: this.tenantId },
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async createBankAccount(dto: any): Promise<BankAccount> {
    const account = this.bankAccountRepo.create({
      ...dto,
      tenantId: this.tenantId,
    });
    return (await this.bankAccountRepo.save(account)) as unknown as BankAccount;
  }

  async findAllBankAccounts() {
    return this.bankAccountRepo.find({
      where: { isActive: true, tenantId: this.tenantId },
    });
  }

  async findBankTransactions(bankAccountId: string) {
    return this.bankTransactionRepo.find({
      where: { bankAccountId, tenantId: this.tenantId },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findUnreconciledJournalLines(bankAccountId: string) {
    const account = await this.bankAccountRepo.findOne({
      where: { id: bankAccountId, tenantId: this.tenantId },
    });
    if (!account) throw new NotFoundException('Bank account not found');

    // Get the GL account associated with this bank account
    // For now, let's assume we find it by name or code if we had a link.
    // Ideally, BankAccount should have a glAccountId.
    // Let's check the entity.
    return this.journalLineRepo
      .createQueryBuilder('line')
      .innerJoinAndSelect('line.journalEntry', 'entry')
      .where('line.accountId = :glAccountId', {
        glAccountId: account.glAccountId,
      })
      .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId })
      .andWhere('line.isReconciled = :isReconciled', { isReconciled: false })
      .orderBy('entry.entryDate', 'DESC')
      .getMany();
  }

  async autoMatchTransactions(bankAccountId: string) {
    const unreconciled = await this.bankTransactionRepo.find({
      where: {
        bankAccountId,
        tenantId: this.tenantId,
        status: TransactionStatus.UNRECONCILED,
      },
    });

    let matchCount = 0;
    for (const trx of unreconciled) {
      // Fuzzy match: same amount and date within +/- 3 days
      const amount = Math.abs(Number(trx.amount));
      const startDate = dayjs(trx.date).subtract(3, 'day').format('YYYY-MM-DD');
      const endDate = dayjs(trx.date).add(3, 'day').format('YYYY-MM-DD');

      const potentialMatch = await this.journalLineRepo
        .createQueryBuilder('line')
        .innerJoinAndSelect('line.journalEntry', 'entry')
        .where('ABS(line.debit - line.credit) = :amount', { amount })
        .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId })
        .andWhere('entry.entryDate >= :startDate', { startDate })
        .andWhere('entry.entryDate <= :endDate', { endDate })
        .getOne();

      if (potentialMatch) {
        trx.status = TransactionStatus.RECONCILED;
        trx.matchedJournalEntryId = potentialMatch.journalEntryId;
        await this.bankTransactionRepo.save(trx);
        matchCount++;
      }
    }

    return { matchCount };
  }

  async getReconciliationReport(bankAccountId: string) {
    const account = await this.bankAccountRepo.findOne({
      where: { id: bankAccountId, tenantId: this.tenantId },
    });
    if (!account) throw new NotFoundException('Bank account not found');

    const reconciledTransactions = await this.bankTransactionRepo.find({
      where: {
        bankAccountId,
        tenantId: this.tenantId,
        status: TransactionStatus.RECONCILED,
      },
    });

    const unreconciledTransactions = await this.bankTransactionRepo.find({
      where: {
        bankAccountId,
        tenantId: this.tenantId,
        status: TransactionStatus.UNRECONCILED,
      },
    });

    const reconciledBalance = reconciledTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    return {
      accountName: account.accountName,
      bankBalance: account.balance,
      reconciledBalance,
      difference: Number(account.balance) - reconciledBalance,
      unreconciledCount: unreconciledTransactions.length,
    };
  }

  async computeVATReturn(startDate: string, endDate: string) {
    // Output Tax: from Invoices
    const outputTaxResult = await this.invoiceRepo
      .createQueryBuilder('inv')
      .select('SUM(inv.taxAmount)', 'total')
      .where('inv.tenantId = :tenantId', { tenantId: this.tenantId })
      .andWhere('inv.issueDate >= :startDate', { startDate })
      .andWhere('inv.issueDate <= :endDate', { endDate })
      .andWhere('inv.status != :status', { status: InvoiceStatus.CANCELLED })
      .getRawOne();

    // Input Tax: from Bills
    const inputTaxResult = await this.billRepo
      .createQueryBuilder('bill')
      .select('SUM(bill.taxAmount)', 'total')
      .where('bill.tenantId = :tenantId', { tenantId: this.tenantId })
      .andWhere('bill.issueDate >= :startDate', { startDate })
      .andWhere('bill.issueDate <= :endDate', { endDate })
      .andWhere('bill.status != :status', { status: BillStatus.VOID })
      .getRawOne();

    const outputTax = Number(outputTaxResult?.total) || 0;
    const inputTax = Number(inputTaxResult?.total) || 0;

    return {
      period: { startDate, endDate },
      outputTax,
      inputTax,
      vatPayable: outputTax - inputTax,
    };
  }

  async exportVATReturnPdf(startDate: string, endDate: string) {
    const data = await this.computeVATReturn(startDate, endDate);
    const template = `
      <h1>VAT Return Report</h1>
      <p>Period: {{period.startDate}} to {{period.endDate}}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Description</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 8px;">Output VAT (Sales)</td>
          <td style="text-align: right; padding: 8px;">{{outputTax}}</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Input VAT (Purchases)</td>
          <td style="text-align: right; padding: 8px;">{{inputTax}}</td>
        </tr>
        <tr style="font-weight: bold;">
          <td style="padding: 8px; border-top: 2px solid #eee;">VAT Payable / (Refundable)</td>
          <td style="text-align: right; padding: 8px; border-top: 2px solid #eee;">{{vatPayable}}</td>
        </tr>
      </table>
    `;
    return this.pdfService.generatePdf(template, data);
  }

  private async getTenantBaseCurrency(): Promise<string> {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) return 'USD';
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    return tenant?.currency || 'USD';
  }

  async createJournalEntry(dto: CreateJournalEntryDto): Promise<JournalEntry> {
    return this.dataSource.transaction(async (manager) => {
      const tenantBaseCurrency = await this.getTenantBaseCurrency();
      const entryCurrency = dto.currency || tenantBaseCurrency;
      const exchangeRate =
        dto.exchangeRate ||
        (await this.currencyService.getLatestRate(
          entryCurrency,
          tenantBaseCurrency,
        ));

      const totalDebitOrig = dto.lines.reduce((s, l) => s + Number(l.debit), 0);
      const totalCreditOrig = dto.lines.reduce(
        (s, l) => s + Number(l.credit),
        0,
      );

      if (Math.abs(totalDebitOrig - totalCreditOrig) > 0.01) {
        throw new BadRequestException(
          `Journal entry must balance in ${entryCurrency}: debit=${totalDebitOrig} credit=${totalCreditOrig}`,
        );
      }

      // Check if period is open
      const period = await manager.findOne(AccountingPeriod, {
        where: {
          tenantId: this.tenantId,
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

      const lines = dto.lines.map((l) => {
        const debitBase = Number(l.debit) * exchangeRate;
        const creditBase = Number(l.credit) * exchangeRate;
        return manager.create(JournalLine, {
          ...l,
          tenantId: this.tenantId,
          originalDebit: l.debit,
          originalCredit: l.credit,
          debit: debitBase,
          credit: creditBase,
        });
      });

      const totalDebitBase = lines.reduce((s, l) => s + Number(l.debit), 0);
      const totalCreditBase = lines.reduce((s, l) => s + Number(l.credit), 0);

      const entry = manager.create(JournalEntry, {
        ...dto,
        tenantId: this.tenantId,
        currency: entryCurrency,
        exchangeRate,
        status: (dto.status as any) || JournalStatus.PENDING_REVIEW,
        totalDebit: totalDebitBase,
        totalCredit: totalCreditBase,
        lines,
        preparerId: this.cls.get('userId'),
      });

      const saved = await manager.save(entry);

      if (saved.status === JournalStatus.POSTED) {
        await this.updateAccountBalances(saved, manager);
      }

      this.logger.log(
        `Journal entry created: ${saved.entryNumber} (Status: ${saved.status})`,
      );
      // We need to return with lines loaded for the frontend
      return manager.findOne(JournalEntry, {
        where: { id: saved.id, tenantId: this.tenantId },
        relations: ['lines'],
      }) as Promise<JournalEntry>;
    });
  }

  async reviewJournal(id: string): Promise<JournalEntry> {
    const entry = await this.findJournalById(id);
    if (entry.status !== JournalStatus.PENDING_REVIEW) {
      throw new BadRequestException('Journal is not pending review');
    }
    entry.status = JournalStatus.PENDING_APPROVAL;
    entry.reviewerId = this.cls.get('userId');
    entry.reviewedAt = new Date();
    return this.journalRepo.save(entry);
  }

  async approveJournal(id: string): Promise<JournalEntry> {
    const entry = await this.findJournalById(id);
    if (entry.status !== JournalStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Journal is not pending approval');
    }
    entry.status = JournalStatus.APPROVED;
    entry.approverId = this.cls.get('userId');
    entry.approvedAt = new Date();
    return this.journalRepo.save(entry);
  }

  async postJournal(id: string): Promise<JournalEntry> {
    return this.dataSource.transaction(async (manager) => {
      const entry = await manager.findOne(JournalEntry, {
        where: { id, tenantId: this.tenantId },
        relations: ['lines'],
      });

      if (!entry) throw new NotFoundException(`Journal "${id}" not found`);

      if (
        ![JournalStatus.APPROVED, JournalStatus.DRAFT].includes(entry.status)
      ) {
        throw new BadRequestException(
          'Only approved or draft journals can be posted',
        );
      }

      entry.status = JournalStatus.POSTED;
      const saved = await manager.save(entry);
      await this.updateAccountBalances(saved, manager);

      this.logger.log(`Journal entry posted: ${saved.entryNumber}`);
      return saved;
    });
  }

  async rejectJournal(id: string, reason: string): Promise<JournalEntry> {
    const entry = await this.findJournalById(id);
    entry.status = JournalStatus.REJECTED;
    entry.rejectionReason = reason;
    return this.journalRepo.save(entry);
  }

  private async updateAccountBalances(
    entry: JournalEntry,
    manager: EntityManager,
  ) {
    for (const line of entry.lines) {
      const account = await manager.findOne(Account, {
        where: { id: line.accountId, tenantId: this.tenantId },
      });

      if (!account) continue;

      let amountToUpdate = 0;
      if (account.currency === entry.currency) {
        amountToUpdate =
          Number(line.originalDebit) - Number(line.originalCredit);
      } else {
        const rateToAccount = await this.currencyService.getLatestRate(
          entry.currency,
          account.currency,
        );
        amountToUpdate =
          (Number(line.originalDebit) - Number(line.originalCredit)) *
          rateToAccount;
      }

      // Determine direction based on account type
      // ASSET/EXPENSE: + balance for Debit (positive amountToUpdate)
      // LIABILITY/EQUITY/REVENUE: + balance for Credit (negative amountToUpdate)
      const isDebitNormal = [AccountType.ASSET, AccountType.EXPENSE].includes(
        account.type,
      );
      const finalAdjustment = isDebitNormal ? amountToUpdate : -amountToUpdate;

      await manager
        .createQueryBuilder()
        .update(Account)
        .set({
          balance: () => `balance + ${finalAdjustment}`,
        })
        .where('id = :id AND tenantId = :tenantId', {
          id: account.id,
          tenantId: this.tenantId,
        })
        .execute();
    }
  }

  async revalueForeignCurrencyBalances(asOfDate: string) {
    const baseCurrency = await this.getTenantBaseCurrency();
    const accounts = await this.accountRepo.find({
      where: { isActive: true, tenantId: this.tenantId },
    });

    const foreignAccounts = accounts.filter(
      (acc) => acc.currency !== baseCurrency,
    );

    let totalAdjustment = 0;
    const lines: any[] = [];

    for (const acc of foreignAccounts) {
      const currentBalance = Number(acc.balance);
      if (currentBalance === 0) continue;

      const latestRate = await this.currencyService.getLatestRate(
        acc.currency,
        baseCurrency,
      );

      // Current value in base currency recorded in GL (sum of JournalLines)
      const currentBaseValueResult = await this.journalLineRepo
        .createQueryBuilder('line')
        .innerJoin('line.journalEntry', 'entry')
        .select('SUM(line.debit - line.credit)', 'balance')
        .where('line.accountId = :accId', { accId: acc.id })
        .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId })
        .andWhere('entry.entryDate <= :asOfDate', { asOfDate })
        .getRawOne();

      const currentBaseValue = Number(currentBaseValueResult.balance) || 0;
      const newValueInBase = currentBalance * latestRate;
      const adjustment = newValueInBase - currentBaseValue;

      if (Math.abs(adjustment) > 0.01) {
        lines.push({
          accountId: acc.id,
          debit: adjustment > 0 ? Math.abs(adjustment) : 0,
          credit: adjustment < 0 ? Math.abs(adjustment) : 0,
        });
        totalAdjustment += adjustment;
      }
    }

    if (lines.length > 0) {
      // Offset with Gain/Loss account (e.g., 5800)
      const gainLossAccount = await this.findAccountByCode('5800');
      lines.push({
        accountId: gainLossAccount.id,
        debit: totalAdjustment < 0 ? Math.abs(totalAdjustment) : 0,
        credit: totalAdjustment > 0 ? Math.abs(totalAdjustment) : 0,
      });

      await this.createJournalEntry({
        entryNumber: `REVAL-${asOfDate}`,
        entryDate: asOfDate,
        description: `Foreign currency revaluation as of ${asOfDate}`,
        lines: lines.map((l) => ({
          ...l,
          // Since revaluation is directly in base currency adjustment
          originalDebit: l.debit,
          originalCredit: l.credit,
        })),
        currency: baseCurrency,
        exchangeRate: 1,
      } as any);

      return { adjustedAccounts: lines.length - 1, totalAdjustment };
    }

    return { adjustedAccounts: 0, totalAdjustment: 0 };
  }

  async findAllJournals(page = 1, limit = 20) {
    const [data, total] = await this.journalRepo.findAndCount({
      where: { tenantId: this.tenantId },
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
      where: { id, tenantId: this.tenantId },
      relations: ['lines'],
    });
    if (!entry) throw new NotFoundException(`Journal entry "${id}" not found`);
    return entry;
  }

  async removeJournal(id: string): Promise<void> {
    await this.findJournalById(id);
    await this.journalRepo.softDelete({ id, tenantId: this.tenantId });
  }

  async createCreditNote(dto: any): Promise<CreditNote> {
    const invoice = await this.findInvoiceById(dto.invoiceId);
    const creditNote = this.creditNoteRepo.create({
      ...dto,
      isApplied: true,
    });
    const saved = (await this.creditNoteRepo.save(
      creditNote,
    )) as unknown as CreditNote;

    // Trigger auto-journal: Debit Revenue (4000), Credit AR (1100)
    const revenueAccount = await this.findAccountByCode('4000');
    const arAccount = await this.findAccountByCode('1100');

    await this.createJournalEntry({
      entryNumber: `CN-${saved.noteNumber}`,
      entryDate: saved.issueDate,
      description: `Credit Note for Invoice ${invoice.invoiceNumber}: ${saved.reason}`,
      reference: invoice.invoiceNumber,
      lines: [
        { accountId: revenueAccount.id, debit: saved.amount, credit: 0 },
        { accountId: arAccount.id, debit: 0, credit: saved.amount },
      ],
    } as any);

    return saved;
  }

  async exportInvoicePdf(id: string): Promise<Buffer> {
    const invoice = await this.findInvoiceById(id);
    const tenantId = this.cls.get('tenantId');
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });

    if (!tenant) throw new NotFoundException('Tenant not found');

    const data = {
      ...invoice,
      title: invoice.isTaxInvoice ? 'TAX INVOICE' : 'INVOICE',
      tenantName: tenant.name,
      tenantAddress: tenant.address,
      tenantEmail: tenant.email,
      issueDate: dayjs(invoice.issueDate).format('MMMM D, YYYY'),
      dueDate: dayjs(invoice.dueDate).format('MMMM D, YYYY'),
      paymentTerms: 'Net 30',
      bankDetails: 'International Bank, IBAN: GB29 IBAN 1234 5678 9012 34',
      formatCurrency: (val: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: tenant.currency || 'USD',
        }).format(val),
    };

    return this.pdfService.generatePdf(INVOICE_TEMPLATE, data);
  }

  async createBill(dto: any): Promise<Bill> {
    // 3-Way Matching Logic
    if (dto.purchaseOrderId && dto.grnId) {
      const po = await this.poRepo.findOne({
        where: { id: dto.purchaseOrderId, tenantId: this.tenantId },
        relations: ['lines'],
      });
      const grn = await this.grnRepo.findOne({
        where: { id: dto.grnId, tenantId: this.tenantId },
        relations: ['lines'],
      });

      if (!po || !grn) {
        throw new BadRequestException('PO or GRN not found for matching');
      }

      this.logger.log(
        `Performing 3-way match for PO: ${po.poNumber} and GRN: ${grn.grnNumber}`,
      );

      // Simple mismatch validation
      for (const line of dto.lines) {
        const poItem = po.lines.find(
          (i) => (i as any).description === line.description,
        );
        const grnItem = grn.lines.find(
          (i) => (i as any).description === line.description,
        );

        if (poItem && line.unitPrice > Number(poItem.unitCost) * 1.05) {
          this.logger.warn(
            `Price mismatch: Bill price ${line.unitPrice} exceeds PO price ${poItem.unitCost} by > 5%`,
          );
        }

        if (grnItem && line.quantity > Number(grnItem.receivedQuantity)) {
          throw new BadRequestException(
            `Quantity mismatch: Bill quantity ${line.quantity} exceeds GRN quantity ${grnItem.receivedQuantity}`,
          );
        }
      }
    }

    const lines = dto.lines.map((l: any) => {
      const line = this.billLineRepo.create({
        ...l,
        tenantId: this.tenantId,
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
      tenantId: this.tenantId,
      subtotal,
      taxAmount,
      totalAmount,
      lines,
    });

    const saved = (await this.billRepo.save(bill)) as unknown as Bill;
    this.logger.log(`Bill created: ${saved.billNumber}`);

    return saved;
  }

  async getRevenueMTD(): Promise<number> {
    const startOfMonth = dayjs().startOf('month').toISOString();
    const result = await this.invoiceRepo
      .createQueryBuilder('inv')
      .select('SUM(inv.totalAmount)', 'total')
      .where('inv.tenantId = :tenantId', { tenantId: this.tenantId })
      .andWhere('inv.issueDate >= :startOfMonth', { startOfMonth })
      .andWhere('inv.status IN (:...statuses)', {
        statuses: [
          InvoiceStatus.SENT,
          InvoiceStatus.PAID,
          InvoiceStatus.PARTIALLY_PAID,
        ],
      })
      .getRawOne();
    return Number(result?.total) || 0;
  }

  async getPendingInvoicesCount(): Promise<number> {
    return this.invoiceRepo.count({
      where: {
        tenantId: this.tenantId,
        status: In([
          InvoiceStatus.SENT,
          InvoiceStatus.PARTIALLY_PAID,
          InvoiceStatus.OVERDUE,
        ]),
      } as any,
    });
  }

  async findAllBills(page = 1, limit = 20) {
    const [data, total] = await this.billRepo.findAndCount({
      where: { tenantId: this.tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['lines'],
    });
    return { data, meta: { total, page, limit } };
  }

  async findBillById(id: string): Promise<Bill> {
    const bill = await this.billRepo.findOne({
      where: { id, tenantId: this.tenantId },
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
        entryNumber: `BILL-${bill.billNumber}`,
        entryDate: new Date().toISOString(),
        description: `Expense recorded for Bill ${bill.billNumber}`,
        reference: bill.billNumber,
        lines: [
          {
            accountId: expenseAccount.id,
            debit: bill.totalAmount,
            credit: 0,
          },
          {
            accountId: apAccount.id,
            debit: 0,
            credit: bill.totalAmount,
          },
        ],
      });
      this.logger.log(
        `Auto-journal posted for approved bill: ${bill.billNumber}`,
      );
    }

    return saved;
  }

  async getTrialBalance(asOfDate?: string, comparativeDate?: string) {
    const today = asOfDate || new Date().toISOString().split('T')[0];
    const accounts = await this.accountRepo.find({
      where: { isActive: true, tenantId: this.tenantId },
    });

    const getBalancesAtDate = async (date: string) => {
      const results = await this.journalLineRepo
        .createQueryBuilder('line')
        .innerJoin('line.journalEntry', 'entry')
        .select('line.accountId', 'accountId')
        .addSelect('SUM(line.debit - line.credit)', 'balance')
        .where('line.tenantId = :tenantId', { tenantId: this.tenantId })
        .andWhere('entry.entryDate <= :date', { date })
        .groupBy('line.accountId')
        .getRawMany();

      return results.reduce((acc, curr) => {
        acc[curr.accountId] = Number(curr.balance);
        return acc;
      }, {});
    };

    const currentBalances = await getBalancesAtDate(today);
    const prevBalances = comparativeDate
      ? await getBalancesAtDate(comparativeDate)
      : null;

    return accounts.map((acc) => {
      const balance = currentBalances[acc.id] || 0;
      const prevBalance = prevBalances ? prevBalances[acc.id] || 0 : 0;

      return {
        accountId: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit: balance > 0 ? balance : 0,
        credit: balance < 0 ? Math.abs(balance) : 0,
        prevDebit: prevBalance > 0 ? prevBalance : 0,
        prevCredit: prevBalance < 0 ? Math.abs(prevBalance) : 0,
        variance: balance - prevBalance,
      };
    });
  }

  async getIncomeStatement(startDate: string, endDate: string) {
    const revenues = await this.journalLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.journalEntry', 'entry')
      .innerJoin('line.account', 'acc')
      .select('acc.name', 'name')
      .addSelect('acc.code', 'code')
      .addSelect('SUM(line.credit - line.debit)', 'amount')
      .where('acc.type = :type', { type: AccountType.REVENUE })
      .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId })
      .andWhere('entry.entryDate >= :startDate', { startDate })
      .andWhere('entry.entryDate <= :endDate', { endDate })
      .groupBy('acc.id')
      .getRawMany();

    const expenses = await this.journalLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.journalEntry', 'entry')
      .innerJoin('line.account', 'acc')
      .select('acc.name', 'name')
      .addSelect('acc.code', 'code')
      .addSelect('SUM(line.debit - line.credit)', 'amount')
      .where('acc.type = :type', { type: AccountType.EXPENSE })
      .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId })
      .andWhere('entry.entryDate >= :startDate', { startDate })
      .andWhere('entry.entryDate <= :endDate', { endDate })
      .groupBy('acc.id')
      .getRawMany();

    const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      revenues: revenues.map((r) => ({ ...r, amount: Number(r.amount) })),
      expenses: expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
      totalRevenue,
      totalExpense,
      netIncome: totalRevenue - totalExpense,
    };
  }

  async getBalanceSheet(asOfDate: string) {
    const getBalancesByType = async (type: AccountType) => {
      return this.journalLineRepo
        .createQueryBuilder('line')
        .innerJoin('line.journalEntry', 'entry')
        .innerJoin('line.account', 'acc')
        .select('acc.name', 'name')
        .addSelect('acc.code', 'code')
        .addSelect('SUM(line.debit - line.credit)', 'balance')
        .where('acc.type = :type', { type })
        .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId })
        .andWhere('entry.entryDate <= :asOfDate', { asOfDate })
        .groupBy('acc.id')
        .getRawMany();
    };

    const assets = await getBalancesByType(AccountType.ASSET);
    const liabilities = await getBalancesByType(AccountType.LIABILITY);
    const equity = await getBalancesByType(AccountType.EQUITY);

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalLiabilities = liabilities.reduce(
      (sum, l) => sum + Math.abs(Number(l.balance)),
      0,
    );
    const totalEquity = equity.reduce(
      (sum, e) => sum + Math.abs(Number(e.balance)),
      0,
    );

    return {
      assets: assets.map((a) => ({ ...a, balance: Number(a.balance) })),
      liabilities: liabilities.map((l) => ({
        ...l,
        balance: Math.abs(Number(l.balance)),
      })),
      equity: equity.map((e) => ({
        ...e,
        balance: Math.abs(Number(e.balance)),
      })),
      totalAssets,
      totalLiabilities,
      totalEquity,
    };
  }

  async getCashFlowReport(startDate: string, endDate: string) {
    // Indirect Method: Start with Net Income and adjust
    const incomeStatement = await this.getIncomeStatement(startDate, endDate);

    // Simplified Cash Flow: Sum of all movements in 'Cash and Bank' accounts
    const cashAccounts = await this.accountRepo.find({
      where: { code: Like('111%'), tenantId: this.tenantId },
    });
    const cashAccountIds = cashAccounts.map((a) => a.id);

    const cashMovements = await this.journalLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.journalEntry', 'entry')
      .select('SUM(line.debit)', 'inflow')
      .addSelect('SUM(line.credit)', 'outflow')
      .where('line.accountId IN (:...ids)', { ids: cashAccountIds })
      .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId })
      .andWhere('entry.entryDate >= :startDate', { startDate })
      .andWhere('entry.entryDate <= :endDate', { endDate })
      .getRawOne();

    const totalInflow = Number(cashMovements?.inflow) || 0;
    const totalOutflow = Number(cashMovements?.outflow) || 0;

    return {
      netIncome: incomeStatement.netIncome,
      totalInflow,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
      operatingActivities: [
        { name: 'Net Income', amount: incomeStatement.netIncome },
        { name: 'Depreciation Adjustment', amount: 0 },
      ],
      investingActivities: [],
      financingActivities: [],
    };
  }

  async reopenPeriod(id: string): Promise<AccountingPeriod> {
    const period = await this.periodRepo.findOne({
      where: { id, tenantId: this.tenantId },
    });
    if (!period) throw new NotFoundException('Period not found');

    period.status = PeriodStatus.OPEN;
    return this.periodRepo.save(period);
  }

  async closePeriod(id: string): Promise<AccountingPeriod> {
    const period = await this.periodRepo.findOne({
      where: { id, tenantId: this.tenantId },
    });
    if (!period) throw new NotFoundException('Period not found');

    period.status = PeriodStatus.CLOSED;
    return this.periodRepo.save(period);
  }

  async scheduleARReminders() {
    const overdueInvoices = await this.invoiceRepo.find({
      where: {
        tenantId: this.tenantId,
        status: In([
          InvoiceStatus.SENT,
          InvoiceStatus.PARTIALLY_PAID,
          InvoiceStatus.OVERDUE,
        ]),
        dueDate: LessThanOrEqual(dayjs().format('YYYY-MM-DD')),
      } as any,
    });

    for (const inv of overdueInvoices) {
      await this.arReminderQueue.add('send_reminder', {
        invoiceId: inv.id,
        customerEmail: inv.customerEmail,
        amountDue: Number(inv.totalAmount) - Number(inv.paidAmount),
      });
    }

    return { count: overdueInvoices.length };
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
      .where('line.accountId = :accountId', { accountId })
      .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId });

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
        tenantId: this.tenantId,
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

  async getAPAgingReport() {
    const today = new Date();
    const bills = await this.billRepo.find({
      where: {
        tenantId: this.tenantId,
        status: In([
          BillStatus.PENDING_APPROVAL,
          BillStatus.APPROVED,
          BillStatus.PARTIALLY_PAID,
          BillStatus.OVERDUE,
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

    bills.forEach((bill) => {
      const dueDate = new Date(bill.dueDate);
      const diffDays = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24),
      );
      // Assuming unpaidAmount field exists or calculating it
      const amount =
        Number(bill.totalAmount) - (Number((bill as any).paidAmount) || 0);

      if (diffDays <= 0) aging.current += amount;
      else if (diffDays <= 30) aging['1_30'] += amount;
      else if (diffDays <= 60) aging['31_60'] += amount;
      else if (diffDays <= 90) aging['61_90'] += amount;
      else aging['90_plus'] += amount;
    });

    return aging;
  }

  async recordPayment(dto: {
    targetId: string;
    type: 'INVOICE' | 'BILL';
    amount: number;
    paymentDate: string;
    bankAccountId: string;
    reference?: string;
    tdsRate?: number; // Optional TDS/WHT rate
  }) {
    const cashAccount = await this.findAccountByCode('1010'); // Generic cash/bank account

    if (dto.type === 'INVOICE') {
      const invoice = await this.findInvoiceById(dto.targetId);
      const arAccount = await this.findAccountByCode('1100');

      invoice.paidAmount = Number(invoice.paidAmount) + dto.amount;
      if (invoice.paidAmount >= invoice.totalAmount) {
        invoice.status = InvoiceStatus.PAID;
      } else {
        invoice.status = InvoiceStatus.PARTIALLY_PAID;
      }
      await this.invoiceRepo.save(invoice);

      await this.createJournalEntry({
        entryNumber: `PAY-IN-${invoice.invoiceNumber}-${Date.now()}`,
        entryDate: dto.paymentDate,
        description: `Payment for Invoice ${invoice.invoiceNumber}`,
        reference: dto.reference || invoice.invoiceNumber,
        lines: [
          { accountId: cashAccount.id, debit: dto.amount, credit: 0 },
          { accountId: arAccount.id, debit: 0, credit: dto.amount },
        ],
      } as any);
    } else {
      const bill = await this.findBillById(dto.targetId);
      const apAccount = await this.findAccountByCode('2100');
      const tdsAccount = await this.findAccountByCode('2130'); // Taxes Payable / TDS

      const tdsAmount = dto.tdsRate ? (dto.amount * dto.tdsRate) / 100 : 0;
      const netPayment = dto.amount - tdsAmount;

      (bill as any).paidAmount =
        (Number((bill as any).paidAmount) || 0) + dto.amount;
      if ((bill as any).paidAmount >= bill.totalAmount) {
        bill.status = BillStatus.PAID;
      } else {
        bill.status = BillStatus.PARTIALLY_PAID;
      }
      await this.billRepo.save(bill);

      await this.createJournalEntry({
        entryNumber: `PAY-OUT-${(bill as any).billNumber}-${Date.now()}`,
        entryDate: dto.paymentDate,
        description: `Payment for Bill ${(bill as any).billNumber}${tdsAmount > 0 ? ' (Net of TDS)' : ''}`,
        reference: dto.reference || (bill as any).billNumber,
        lines: [
          { accountId: apAccount.id, debit: dto.amount, credit: 0 },
          { accountId: cashAccount.id, debit: 0, credit: netPayment },
          ...(tdsAmount > 0
            ? [{ accountId: tdsAccount.id, debit: 0, credit: tdsAmount }]
            : []),
        ],
      } as any);
    }

    return { success: true };
  }

  async exportTDSChallan(_paymentId: string): Promise<Buffer> {
    // In a real system, we'd fetch the payment/journal details
    const data = {
      challanNumber: `TDS-${Date.now()}`,
      deducteeName: 'Vendor Name',
      panNumber: 'ABCDE1234F',
      tdsAmount: 1000,
      paymentDate: new Date().toLocaleDateString(),
    };

    const template = `
      <h1>TDS Challan</h1>
      <p>Challan #: {{challanNumber}}</p>
      <p>Deductee: {{deducteeName}}</p>
      <p>PAN: {{panNumber}}</p>
      <p>Amount: {{tdsAmount}}</p>
      <p>Date: {{paymentDate}}</p>
    `;

    return this.pdfService.generatePdf(template, data);
  }

  async importBankStatement(bankAccountId: string, transactions: any[]) {
    const saved: BankTransaction[] = [];
    for (const trx of transactions) {
      const entry = this.bankTransactionRepo.create({
        ...trx,
        bankAccountId,
        tenantId: this.tenantId,
        status: TransactionStatus.UNRECONCILED,
      });
      saved.push((await this.bankTransactionRepo.save(entry)) as any);
    }
    return saved;
  }

  async reconcileTransaction(transactionId: string, journalEntryId: string) {
    const trx = await this.bankTransactionRepo.findOne({
      where: { id: transactionId, tenantId: this.tenantId },
    });
    if (!trx) throw new NotFoundException('Transaction not found');

    trx.status = TransactionStatus.RECONCILED;
    trx.matchedJournalEntryId = journalEntryId;
    return this.bankTransactionRepo.save(trx);
  }

  async createTaxRate(dto: any) {
    const taxRate = this.taxRateRepo.create({
      ...dto,
      tenantId: this.tenantId,
    });
    return this.taxRateRepo.save(taxRate);
  }

  async findAllTaxRates() {
    return this.taxRateRepo.find({
      where: { tenantId: this.tenantId },
      order: { name: 'ASC' },
    });
  }

  async updateTaxRate(id: string, dto: any) {
    await this.taxRateRepo.update({ id, tenantId: this.tenantId }, dto);
    return this.taxRateRepo.findOne({
      where: { id, tenantId: this.tenantId },
    });
  }

  async getBudgetVsActualReport(period: string) {
    const budgets = await this.budgetRepo.find({
      where: { period, tenantId: this.tenantId },
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
          .andWhere('line.tenantId = :tenantId', { tenantId: this.tenantId })
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

  @OnEvent('inventory.stock_valuation_updated')
  async handleStockValuation(payload: {
    totalValue: number;
    description: string;
  }) {
    this.logger.log(`Handling stock valuation update: ${payload.description}`);
    const inventoryAccount = await this.findAccountByCode('1130'); // Inventory
    const cogsAccount = await this.findAccountByCode('5100'); // COGS

    // This is a simplified example. Usually, we adjust the difference.
    await this.createJournalEntry({
      entryNumber: `STK-${Date.now()}`,
      entryDate: new Date().toISOString(),
      description: payload.description,
      lines: [
        {
          accountId: inventoryAccount.id,
          debit: payload.totalValue,
          credit: 0,
        },
        { accountId: cogsAccount.id, debit: 0, credit: payload.totalValue },
      ],
    } as any);
  }
}
