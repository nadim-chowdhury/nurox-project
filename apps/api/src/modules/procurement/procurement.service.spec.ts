import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { Vendor } from './entities/vendor.entity';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { Rfq, VendorQuote } from './entities/rfq.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { Grn } from './entities/grn.entity';
import { DebitNote } from './entities/debit-note.entity';
import { ApprovalMatrix } from './entities/approval-matrix.entity';
import { VendorEvaluation } from './entities/vendor-evaluation.entity';
import { VendorBill, VendorBillStatus } from './entities/vendor-bill.entity';
import { VendorBillLine } from './entities/vendor-bill-line.entity';
import { InventoryService } from '../inventory/inventory.service';
import { MailerService } from '../mailer/mailer.service';
import { FinanceService } from '../finance/finance.service';

describe('ProcurementService — Vendor Bills', () => {
  let service: ProcurementService;
  let dataSource: { transaction: jest.Mock };
  let billRepo: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock };
  let financeService: { createBill: jest.Mock };
  let billLineRepo: { createQueryBuilder: jest.Mock };

  const tenantId = 'd3b07384-d113-4c4e-9c8e-cf00257e8412';
  const poId = 'po-1';
  const vendorId = 'vendor-1';

  const mockRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn((e) => Promise.resolve(e)),
    create: jest.fn((dto) => dto),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    dataSource = {
      transaction: jest.fn((cb) =>
        cb({
          findOne: jest.fn(),
          create: jest.fn((_, dto) => dto),
          save: jest.fn((entity) =>
            Promise.resolve({ ...entity, id: 'bill-1' }),
          ),
        }),
      ),
    };
    billRepo = mockRepo();
    financeService = {
      createBill: jest.fn().mockResolvedValue({ id: 'finance-bill-1' }),
    };
    billLineRepo = {
      createQueryBuilder: jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          purchaseValue: '10000',
          inputVat: '1500',
          inputSd: '50',
        }),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcurementService,
        { provide: getRepositoryToken(Vendor), useValue: mockRepo() },
        { provide: getRepositoryToken(PurchaseRequest), useValue: mockRepo() },
        { provide: getRepositoryToken(Rfq), useValue: mockRepo() },
        { provide: getRepositoryToken(VendorQuote), useValue: mockRepo() },
        { provide: getRepositoryToken(PurchaseOrder), useValue: mockRepo() },
        { provide: getRepositoryToken(Grn), useValue: mockRepo() },
        { provide: getRepositoryToken(DebitNote), useValue: mockRepo() },
        { provide: getRepositoryToken(ApprovalMatrix), useValue: mockRepo() },
        { provide: getRepositoryToken(VendorEvaluation), useValue: mockRepo() },
        { provide: getRepositoryToken(VendorBill), useValue: billRepo },
        { provide: getRepositoryToken(VendorBillLine), useValue: billLineRepo },
        {
          provide: InventoryService,
          useValue: { receiveStock: jest.fn(), issueStock: jest.fn() },
        },
        { provide: MailerService, useValue: { sendMail: jest.fn() } },
        { provide: FinanceService, useValue: financeService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(ProcurementService);
  });

  describe('createVendorBill', () => {
    it('rejects when PO vendor mismatch', async () => {
      dataSource.transaction.mockImplementation(async (cb) => {
        const manager = {
          findOne: jest.fn().mockResolvedValue({
            id: poId,
            tenantId,
            vendorId: 'other-vendor',
            lines: [],
          }),
          create: jest.fn((_, dto) => dto),
          save: jest.fn(),
        };
        return cb(manager);
      });

      await expect(
        service.createVendorBill(tenantId, {
          vendorId,
          poId,
          billNumber: 'VB-001',
          billDate: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          lines: [
            {
              description: 'Widget',
              quantity: 1,
              unitCost: 100,
              vatRate: 15,
              sdRate: 0,
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitVendorBill', () => {
    it('creates finance bill and moves status to PENDING_PAYMENT', async () => {
      const bill = {
        id: 'bill-1',
        tenantId,
        poId,
        vendorId,
        status: VendorBillStatus.DRAFT,
        billNumber: 'VB-001',
        billDate: new Date(),
        dueDate: new Date(),
        currency: 'USD',
        subTotal: 100,
        taxTotal: 15,
        totalAmount: 115,
        grnId: null,
        lines: [
          {
            description: 'Part A',
            quantity: 1,
            unitCost: 100,
            lineTaxTotal: 15,
          },
        ],
      };

      jest
        .spyOn(service, 'getVendorBill')
        .mockResolvedValue(bill as VendorBill);
      jest.spyOn(service, 'verifyThreeWayMatch').mockResolvedValue({
        poId,
        poNumber: 'PO-1',
        isMatch: true,
        mismatches: [],
      });
      billRepo.save.mockResolvedValue({
        ...bill,
        status: VendorBillStatus.PENDING_PAYMENT,
        financeBillId: 'finance-bill-1',
      });

      const result = await service.submitVendorBill(tenantId, 'bill-1');

      expect(financeService.createBill).toHaveBeenCalled();
      expect(result.status).toBe(VendorBillStatus.PENDING_PAYMENT);
      expect(result.financeBillId).toBe('finance-bill-1');
    });
  });

  describe('getPurchaseInputTaxForPeriod', () => {
    it('aggregates line-level VAT from submitted bills', async () => {
      const result = await service.getPurchaseInputTaxForPeriod(
        tenantId,
        new Date('2026-05-01'),
        new Date('2026-06-01'),
      );

      expect(result.totalPurchaseValue).toBe(10000);
      expect(result.totalInputVat).toBe(1500);
      expect(result.totalInputSd).toBe(50);
    });
  });
});
