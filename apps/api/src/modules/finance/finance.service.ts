import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Invoice, InvoiceLine } from './entities/invoice.entity';
import { JournalEntry, JournalLine } from './entities/journal.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateJournalEntryDto } from './dto/create-journal.dto';

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
  ) {}

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

  async updateInvoiceStatus(id: string, status: string): Promise<Invoice> {
    await this.findInvoiceById(id);
    await this.invoiceRepo.update(id, { status: status as any });
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

    const lines = dto.lines.map((l) => this.journalLineRepo.create(l));
    const entry = this.journalRepo.create({
      ...dto,
      totalDebit,
      totalCredit,
      lines,
    });
    const saved = await this.journalRepo.save(entry);
    this.logger.log(`Journal entry created: ${saved.entryNumber}`);
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
}
