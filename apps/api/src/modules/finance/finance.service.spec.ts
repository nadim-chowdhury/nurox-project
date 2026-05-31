import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { Invoice, InvoiceLine } from './entities/invoice.entity';
import { JournalEntry, JournalLine } from './entities/journal.entity';
import { Bill, BillLine } from './entities/bill.entity';
import { TaxRate } from './entities/tax-rate.entity';
import { AccountingPeriod } from './entities/accounting-period.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Budget } from './entities/budget.entity';
import { Tenant } from '../system/entities/tenant.entity';
import { CreditNote } from './entities/credit-note.entity';
import { RecurringInvoice } from './entities/recurring-invoice.entity';
import { ExpenseClaim } from './entities/expense-claim.entity';
import {
  PettyCashFund,
  PettyCashTransaction,
} from './entities/petty-cash.entity';
import { Grn as GRN } from '../procurement/entities/grn.entity';
import { PurchaseOrder } from '../procurement/entities/purchase-order.entity';
import { PdfService } from '../system/pdf.service';
import { CurrencyConversionService } from './currency-conversion.service';
import { ClsService } from 'nestjs-cls';
import { DataSource } from 'typeorm';
import { getQueueToken } from '@nestjs/bullmq';

describe('FinanceService', () => {
  let service: FinanceService;
  let module: TestingModule;

  const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    softDelete: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      getRawMany: jest.fn(),
      getMany: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    })),
  });

  const mockDataSource = {
    transaction: jest.fn((cb) =>
      cb({
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: jest.fn(),
        })),
      }),
    ),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: getRepositoryToken(Account), useFactory: mockRepository },
        { provide: getRepositoryToken(Invoice), useFactory: mockRepository },
        {
          provide: getRepositoryToken(InvoiceLine),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(JournalEntry),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(JournalLine),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Bill), useFactory: mockRepository },
        { provide: getRepositoryToken(BillLine), useFactory: mockRepository },
        { provide: getRepositoryToken(TaxRate), useFactory: mockRepository },
        {
          provide: getRepositoryToken(AccountingPeriod),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(BankTransaction),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(BankAccount),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Budget), useFactory: mockRepository },
        { provide: getRepositoryToken(Tenant), useFactory: mockRepository },
        { provide: getRepositoryToken(CreditNote), useFactory: mockRepository },
        {
          provide: getRepositoryToken(RecurringInvoice),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ExpenseClaim),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(PettyCashFund),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(PettyCashTransaction),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(GRN), useFactory: mockRepository },
        {
          provide: getRepositoryToken(PurchaseOrder),
          useFactory: mockRepository,
        },
        {
          provide: PdfService,
          useValue: { generatePdf: jest.fn() },
        },
        {
          provide: CurrencyConversionService,
          useValue: { getLatestRate: jest.fn() },
        },
        {
          provide: ClsService,
          useValue: { get: jest.fn().mockReturnValue('test-tenant-id') },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getQueueToken('ar_reminders'),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should throw ConflictException if account code already exists', async () => {
      const accountRepo = getRepositoryToken(Account);
      const repo = module.get(accountRepo);
      repo.findOne.mockResolvedValue({ id: '1', code: '1010' });

      await expect(
        service.createAccount({
          code: '1010',
          name: 'Test',
          type: 'ASSET' as any,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for circular dependency', async () => {
      const accountRepo = getRepositoryToken(Account);
      const repo = module.get(accountRepo);

      // 1. Mock findAccountById for updateAccount initial check
      repo.findOne.mockResolvedValueOnce({ id: 'account-id', code: '1010' });
      // 2. Mock validateParentAccount -> find parent.
      // If we set parentId to 'account-id', it should trigger circularity check in the next loop.
      repo.findOne.mockResolvedValueOnce({
        id: 'parent-id',
        parentId: 'account-id',
      });

      await expect(
        service.updateAccount('account-id', {
          parentId: 'parent-id',
        }),
      ).rejects.toThrow('Circular dependency detected');
    });
  });

  describe('postJournal', () => {
    it('should update account balances within a transaction', async () => {
      const journalEntry = {
        id: 'journal-id',
        status: 'DRAFT',
        currency: 'USD',
        lines: [
          { accountId: 'acc-1', originalDebit: 100, originalCredit: 0 },
          { accountId: 'acc-2', originalDebit: 0, originalCredit: 100 },
        ],
      };

      const account1 = { id: 'acc-1', type: 'ASSET', currency: 'USD' };
      const account2 = { id: 'acc-2', type: 'LIABILITY', currency: 'USD' };

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(journalEntry) // find journal
          .mockResolvedValueOnce(account1) // find acc-1
          .mockResolvedValueOnce(account2), // find acc-2
        save: jest
          .fn()
          .mockResolvedValue({ ...journalEntry, status: 'POSTED' }),
        createQueryBuilder: jest.fn(() => ({
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: jest.fn(),
        })),
      };

      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager),
      );

      await service.postJournal('journal-id');

      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'POSTED' }),
      );
      expect(mockManager.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  });

  describe('autoMatchTransactions', () => {
    it('should match a bank transaction with a corresponding journal line', async () => {
      const bankAccountId = 'bank-acc-1';
      const glAccountId = 'gl-acc-1';
      const tenantId = 'test-tenant-id';

      const bankAccount = { id: bankAccountId, glAccountId, tenantId };
      const bankTrx = {
        id: 'trx-1',
        amount: 1000,
        date: '2026-05-31',
        tenantId,
        status: 'UNRECONCILED',
      };

      const journalLine = {
        id: 'line-1',
        journalEntryId: 'entry-1',
        debit: 1000,
        credit: 0,
        isReconciled: false,
        journalEntry: {
          id: 'entry-1',
          entryDate: '2026-05-31',
          reference: 'REF-123',
        },
      };

      const bankAccountRepo = module.get(getRepositoryToken(BankAccount));
      const bankTrxRepo = module.get(getRepositoryToken(BankTransaction));
      const journalLineRepo = module.get(getRepositoryToken(JournalLine));

      bankAccountRepo.findOne.mockResolvedValue(bankAccount);
      bankTrxRepo.find.mockResolvedValue([bankTrx]);

      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([journalLine]),
      };
      journalLineRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockManager = {
        save: jest.fn().mockResolvedValue(true),
      };
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager),
      );

      const result = await service.autoMatchTransactions(bankAccountId);

      expect(result.matchCount).toBe(1);
      expect(mockManager.save).toHaveBeenCalledTimes(2); // One for trx, one for line
    });
  });
});
