import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxFilingExport } from '../entities/tax-filing.entity';
import { ComplianceReportService } from './compliance-report.service';
import { ProcurementService } from '../../procurement/procurement.service';
import { Mushak63 } from '../entities/mushak-63.entity';
import { Vendor } from '../../procurement/entities/vendor.entity';
import { Tenant } from '../../system/entities/tenant.entity';
import { PdfService } from '../../system/pdf.service';
import * as archiver from 'archiver';
import { Response } from 'express';

export interface FilingReadinessResult {
  isReady: boolean;
  issues: {
    severity: 'ERROR' | 'WARNING';
    message: string;
    actionUrl?: string;
  }[];
}

@Injectable()
export class TaxFilingService {
  private readonly logger = new Logger(TaxFilingService.name);

  constructor(
    private readonly reportService: ComplianceReportService,
    private readonly procurementService: ProcurementService,
    private readonly pdfService: PdfService,
    @InjectRepository(TaxFilingExport)
    private readonly exportRepo: Repository<TaxFilingExport>,
    @InjectRepository(Mushak63)
    private readonly mushak63Repo: Repository<Mushak63>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async checkReadiness(
    tenantId: string,
    period: string,
  ): Promise<FilingReadinessResult> {
    const issues: FilingReadinessResult['issues'] = [];

    // 1. Check Tenant Info
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant?.taxRegistrationNumber) {
      issues.push({
        severity: 'ERROR',
        message: 'Company BIN (Tax Registration Number) is missing.',
        actionUrl: '/settings/company',
      });
    }

    // 2. Check for missing Vendor BINs in Purchases for the period
    const startDate = new Date(`${period}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // This is a simplified check; in a real scenario, we'd query bills with missing vendor taxId
    const vendorsWithMissingBin = await this.vendorRepo
      .createQueryBuilder('v')
      .innerJoin('vendor_bills', 'b', 'b.vendorId = v.id')
      .where('b.tenantId = :tenantId', { tenantId })
      .andWhere('b.billDate >= :startDate AND b.billDate < :endDate', {
        startDate,
        endDate,
      })
      .andWhere('v.taxId IS NULL OR v.taxId = :empty', { empty: '' })
      .select('DISTINCT v.name', 'name')
      .getRawMany();

    vendorsWithMissingBin.forEach((v) => {
      issues.push({
        severity: 'WARNING',
        message: `Vendor "${v.name}" is missing a BIN. This may lead to input tax credit rejection.`,
      });
    });

    // 3. Check for un-submitted Mushak 6.3s (if we had a status, but here we assume all existing are submitted)

    return {
      isReady: !issues.some((i) => i.severity === 'ERROR'),
      issues,
    };
  }

  async generateFilingPackage(tenantId: string, period: string, res: Response) {
    const readiness = await this.checkReadiness(tenantId, period);
    if (!readiness.isReady) {
      throw new BadRequestException(
        'Filing is not ready. Please resolve ERRORS first.',
      );
    }

    // 1. Generate/Get Mushak 9.1 Data
    const exportRecord = await this.reportService.generateMushak91(
      tenantId,
      period,
    );
    const mushak91Data = exportRecord.payload;

    // 2. Generate Mushak 9.1 PDF
    const mushak91Pdf = await this.pdfService.generatePdf(
      this.getMushak91Template(),
      { ...mushak91Data, period },
    );

    // 3. Create ZIP Package
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment(`VAT-Filing-${period}.zip`);
    archive.pipe(res);

    // Add 9.1 PDF
    archive.append(mushak91Pdf, { name: `Mushak-9.1-${period}.pdf` });

    // Add Summary JSON
    archive.append(JSON.stringify(mushak91Data, null, 2), {
      name: 'summary.json',
    });

    // TODO: Add supporting schedules (Purchase/Sales registers)

    await archive.finalize();
  }

  private getMushak91Template(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .header { text-align: center; }
        .box { border: 1px solid #000; padding: 10px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Mushak-9.1 (VAT Return)</h2>
        <p>Period: {{period}}</p>
    </div>

    <div class="box">
        <h3>Summary</h3>
        <table>
            <tr><td>Total Sales Value</td><td>{{totalSalesValue}}</td></tr>
            <tr><td>Total Output VAT</td><td>{{totalOutputVat}}</td></tr>
            <tr><td>Total Purchase Value</td><td>{{totalPurchaseValue}}</td></tr>
            <tr><td>Total Input VAT</td><td>{{totalInputVat}}</td></tr>
            <tr><td>Decreasing Adjustments</td><td>{{decreasingAdjustments}}</td></tr>
            <tr style="font-weight: bold;"><td>Net Tax Payable</td><td>{{netTaxPayable}}</td></tr>
        </table>
    </div>
</body>
</html>
    `;
  }
}
