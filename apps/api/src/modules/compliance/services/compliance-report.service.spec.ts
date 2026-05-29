import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceReportService } from './compliance-report.service';
import { PdfService } from '../../system/pdf.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mushak63 } from '../entities/mushak-63.entity';
import { VdsCertificate } from '../entities/vds-certificate.entity';
import { TaxFilingExport } from '../entities/tax-filing.entity';
import { NotFoundException } from '@nestjs/common';

describe('ComplianceReportService', () => {
  let service: ComplianceReportService;
  let pdfService: PdfService;

  const mockMushak63Repo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockVdsRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockExportRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((record) => Promise.resolve({ id: 'export-id', ...record })),
  };

  const mockPdfService = {
    generatePdf: jest.fn().mockResolvedValue(Buffer.from('pdf-content')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceReportService,
        { provide: PdfService, useValue: mockPdfService },
        { provide: getRepositoryToken(Mushak63), useValue: mockMushak63Repo },
        { provide: getRepositoryToken(VdsCertificate), useValue: mockVdsRepo },
        {
          provide: getRepositoryToken(TaxFilingExport),
          useValue: mockExportRepo,
        },
      ],
    }).compile();

    service = module.get<ComplianceReportService>(ComplianceReportService);
    pdfService = module.get<PdfService>(PdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMushak63Pdf', () => {
    it('should throw NotFoundException if mushak not found', async () => {
      mockMushak63Repo.findOne.mockResolvedValue(null);
      await expect(service.generateMushak63Pdf('t1', 'id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should generate pdf if mushak found', async () => {
      const mushak = {
        id: 'id',
        issueDate: new Date(),
        items: [],
      };
      mockMushak63Repo.findOne.mockResolvedValue(mushak);
      const result = await service.generateMushak63Pdf('t1', 'id');
      expect(result).toBeDefined();
      expect(pdfService.generatePdf).toHaveBeenCalled();
    });
  });

  describe('generateMushak91', () => {
    it('should aggregate sales and vds certs for a period', async () => {
      mockMushak63Repo.find.mockResolvedValue([
        { totalBaseAmount: 1000, totalVatAmount: 150, totalSdAmount: 0 },
        { totalBaseAmount: 2000, totalVatAmount: 300, totalSdAmount: 50 },
      ]);
      mockVdsRepo.find.mockResolvedValue([{ deductedVatAmount: 100 }]);

      const result = await service.generateMushak91('t1', '2026-05');

      expect(result.payload.totalSalesValue).toBe(3000);
      expect(result.payload.totalOutputVat).toBe(450);
      expect(result.payload.decreasingAdjustments).toBe(100);
      expect(result.payload.netTaxPayable).toBe(400); // (450+50) - 100 = 400
      expect(mockExportRepo.save).toHaveBeenCalled();
    });
  });
});
