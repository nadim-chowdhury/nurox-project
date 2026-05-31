import { Test, TestingModule } from '@nestjs/testing';
import { MushakService } from './mushak.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mushak63 } from '../entities/mushak-63.entity';
import { VdsCertificate } from '../entities/vds-certificate.entity';
import { SequenceService } from '../../system/sequence.service';

describe('MushakService', () => {
  let service: MushakService;

  const mockMushak63Repo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((mushak) => Promise.resolve({ id: 'mushak-id', ...mushak })),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockVdsRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((cert) => Promise.resolve({ id: 'vds-id', ...cert })),
    find: jest.fn(),
  };

  const mockSequenceService = {
    getNextNumber: jest.fn().mockResolvedValue('AUTO-NUM-123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MushakService,
        {
          provide: getRepositoryToken(Mushak63),
          useValue: mockMushak63Repo,
        },
        {
          provide: getRepositoryToken(VdsCertificate),
          useValue: mockVdsRepo,
        },
        {
          provide: SequenceService,
          useValue: mockSequenceService,
        },
      ],
    }).compile();

    service = module.get<MushakService>(MushakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMushak63', () => {
    it('should create a Mushak 6.3 record', async () => {
      const dto = {
        invoiceNumber: 'INV-001',
        issueDate: new Date().toISOString(),
        sellerName: 'Seller',
        sellerBin: '123',
        sellerAddress: 'Addr',
        buyerName: 'Buyer',
        buyerAddress: 'Addr',
        totalBaseAmount: 1000,
        totalVatAmount: 150,
        totalAmountInclTax: 1150,
        items: [
          {
            itemName: 'Item 1',
            unitOfSupply: 'pcs',
            quantity: 1,
            unitPrice: 1000,
            totalPriceExclTax: 1000,
            vatRate: 15,
            vatAmount: 150,
            totalAmountInclTax: 1150,
          },
        ],
      };

      const result = await service.createMushak63('tenant-1', dto as any);
      expect(result).toBeDefined();
      expect(result.id).toBe('mushak-id');
      expect(mockMushak63Repo.save).toHaveBeenCalled();
    });

    it('should use SequenceService if invoiceNumber is missing', async () => {
      const dto = {
        issueDate: new Date().toISOString(),
        sellerName: 'Seller',
        sellerBin: '123',
        sellerAddress: 'Addr',
        buyerName: 'Buyer',
        buyerAddress: 'Addr',
        totalBaseAmount: 1000,
        totalVatAmount: 150,
        totalAmountInclTax: 1150,
        items: [],
      };

      const result = await service.createMushak63('tenant-1', dto as any);
      expect(mockSequenceService.getNextNumber).toHaveBeenCalledWith(
        'tenant-1',
        'MUSHAK_6.3',
        'VAT-',
      );
      expect(result.invoiceNumber).toBe('AUTO-NUM-123');
    });
  });

  describe('createVdsCertificate', () => {
    it('should create a VDS Certificate', async () => {
      const dto = {
        certificateNumber: 'VDS-001',
        issueDate: new Date().toISOString(),
        supplierName: 'Supplier',
        supplierBin: '456',
        referenceMushak63No: 'INV-001',
        referenceMushak63Date: new Date().toISOString(),
        totalAmount: 1150,
        vatAmount: 150,
        deductedVatAmount: 150,
      };

      const result = await service.createVdsCertificate('tenant-1', dto as any);
      expect(result).toBeDefined();
      expect(result.id).toBe('vds-id');
      expect(mockVdsRepo.save).toHaveBeenCalled();
    });
  });
});
