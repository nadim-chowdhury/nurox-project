import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceLine } from './entities/invoice.entity';
import { JournalEntry } from './entities/journal.entity';
import { JournalLine } from './entities/journal.entity';
import { Bill } from './entities/bill.entity';
import { BillLine } from './entities/bill.entity';
import { TaxRate } from './entities/tax-rate.entity';
import { AccountingPeriod } from './entities/accounting-period.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { Budget } from './entities/budget.entity';
import { PdfService } from '../system/pdf.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('FinanceService', () => {
  let service: FinanceService;

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
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      getMany: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        { provide: getRepositoryToken(Budget), useFactory: mockRepository },
        {
          provide: PdfService,
          useValue: {
            generatePdf: jest.fn(),
          },
        },
        {
          provide: getQueueToken('ar_reminders'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
