import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { SalesOrderFlowService } from './sales-order-flow.service';
import { Quotation, QuotationStatus } from './entities/quotation.entity';
import { SalesOrder, SOStatus } from './entities/sales-order.entity';
import { Account } from './entities/account.entity';
import { Product } from '../inventory/entities/product.entity';
import { FinanceService } from '../finance/finance.service';
import { MushakService } from '../compliance/services/mushak.service';

describe('SalesOrderFlowService', () => {
  let service: SalesOrderFlowService;
  let soRepo: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let quotationRepo: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let financeService: { createInvoice: jest.Mock };
  let mushakService: { createMushak63: jest.Mock };

  const tenantId = 'd3b07384-d113-4c4e-9c8e-cf00257e8412';

  const mockRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn((e) => Promise.resolve(e)),
    create: jest.fn((dto) => dto),
    manager: { create: jest.fn((_, dto) => dto) },
  });

  beforeEach(async () => {
    soRepo = mockRepo();
    quotationRepo = mockRepo();
    financeService = {
      createInvoice: jest.fn().mockResolvedValue({ id: 'inv-1' }),
    };
    mushakService = {
      createMushak63: jest.fn().mockResolvedValue({ id: 'mushak-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesOrderFlowService,
        { provide: getRepositoryToken(Quotation), useValue: quotationRepo },
        { provide: getRepositoryToken(SalesOrder), useValue: soRepo },
        { provide: getRepositoryToken(Account), useValue: mockRepo() },
        { provide: getRepositoryToken(Product), useValue: mockRepo() },
        { provide: FinanceService, useValue: financeService },
        { provide: MushakService, useValue: mushakService },
      ],
    }).compile();

    service = module.get(SalesOrderFlowService);
  });

  describe('calculateLineTax', () => {
    it('applies Bangladesh VAT on base plus SD', () => {
      const result = service.calculateLineTax(10, 100, 0, 15, 5);
      expect(result.lineSubtotal).toBe(1000);
      expect(result.sdAmount).toBe(50);
      expect(result.vatAmount).toBe(157.5);
      expect(result.lineTotalInclTax).toBe(1207.5);
    });
  });

  describe('createInvoiceFromSalesOrder', () => {
    it('creates finance invoice and Mushak 6.3', async () => {
      const so = {
        id: 'so-1',
        tenantId,
        soNumber: 'SO-100',
        accountId: 'acc-1',
        status: SOStatus.CONFIRMED,
        currency: 'BDT',
        lines: [
          {
            productId: 'prod-1',
            quantity: 2,
            unitPrice: 500,
            discountPercent: 0,
            taxPercent: 15,
            invoicedQuantity: 0,
          },
        ],
      };

      soRepo.findOne.mockResolvedValue(so);
      soRepo.save.mockResolvedValue({
        ...so,
        status: SOStatus.INVOICED,
        financeInvoiceId: 'inv-1',
        mushak63Id: 'mushak-1',
      });

      const productRepo = (service as any).productRepo;
      productRepo.find.mockResolvedValue([
        { id: 'prod-1', name: 'Widget', sku: 'WGT-01', tenantId },
      ]);
      const accountRepo = (service as any).accountRepo;
      accountRepo.findOne.mockResolvedValue({
        id: 'acc-1',
        name: 'Acme Ltd',
        taxBin: '123456789',
        billingAddress: 'Dhaka',
      });

      const result = await service.createInvoiceFromSalesOrder(
        tenantId,
        'so-1',
        {
          sellerName: 'Nurox Ltd',
          sellerBin: '111111111',
          sellerAddress: 'Dhaka HQ',
        },
      );

      expect(financeService.createInvoice).toHaveBeenCalled();
      expect(mushakService.createMushak63).toHaveBeenCalled();
      expect(result.financeInvoiceId).toBe('inv-1');
      expect(result.mushak63Id).toBe('mushak-1');
    });

    it('rejects already invoiced orders', async () => {
      soRepo.findOne.mockResolvedValue({
        id: 'so-1',
        tenantId,
        status: SOStatus.INVOICED,
        lines: [],
      });

      await expect(
        service.createInvoiceFromSalesOrder(tenantId, 'so-1', {
          sellerName: 'Nurox',
          sellerBin: '111',
          sellerAddress: 'Dhaka',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('convertQuotationToSalesOrder', () => {
    it('requires account on quotation', async () => {
      quotationRepo.findOne.mockResolvedValue({
        id: 'qt-1',
        tenantId,
        status: QuotationStatus.SENT,
        accountId: null,
        lines: [],
      });

      await expect(
        service.convertQuotationToSalesOrder(tenantId, 'qt-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
