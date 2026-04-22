import { Test, TestingModule } from '@nestjs/testing';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

describe('FinanceController', () => {
  let controller: FinanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceController],
      providers: [
        {
          provide: FinanceService,
          useValue: {
            findAllAccountsTree: jest.fn(),
            getIncomeStatement: jest.fn(),
            getBalanceSheet: jest.fn(),
            getCashFlowReport: jest.fn(),
            scheduleARReminders: jest.fn(),
            closePeriod: jest.fn(),
            getRevenueMTD: jest.fn(),
            getPendingInvoicesCount: jest.fn(),
            createAccount: jest.fn(),
            findAllAccounts: jest.fn(),
            findAccountById: jest.fn(),
            updateAccount: jest.fn(),
            removeAccount: jest.fn(),
            createInvoice: jest.fn(),
            findAllInvoices: jest.fn(),
            findInvoiceById: jest.fn(),
            updateInvoiceStatus: jest.fn(),
            removeInvoice: jest.fn(),
            createJournalEntry: jest.fn(),
            findAllJournals: jest.fn(),
            findJournalById: jest.fn(),
            removeJournal: jest.fn(),
            createBill: jest.fn(),
            findAllBills: jest.fn(),
            findBillById: jest.fn(),
            updateBillStatus: jest.fn(),
            getTrialBalance: jest.fn(),
            getGeneralLedger: jest.fn(),
            getARAgingReport: jest.fn(),
            importBankStatement: jest.fn(),
            reconcileTransaction: jest.fn(),
            createTaxRate: jest.fn(),
            findAllTaxRates: jest.fn(),
            updateTaxRate: jest.fn(),
            getBudgetVsActualReport: jest.fn(),
            exportTrialBalancePdf: jest.fn(),
            exportTrialBalanceExcel: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FinanceController>(FinanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
