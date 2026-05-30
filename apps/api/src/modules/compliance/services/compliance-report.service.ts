import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PdfService } from '../../system/pdf.service';
import { Mushak63 } from '../entities/mushak-63.entity';
import { VdsCertificate } from '../entities/vds-certificate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaxFilingExport } from '../entities/tax-filing.entity';
import { Between } from 'typeorm';
import { Mushak91Dto } from '@repo/shared-schemas';
import { ProcurementService } from '../../procurement/procurement.service';

@Injectable()
export class ComplianceReportService {
  private readonly logger = new Logger(ComplianceReportService.name);

  constructor(
    private readonly pdfService: PdfService,
    private readonly procurementService: ProcurementService,
    @InjectRepository(Mushak63)
    private readonly mushak63Repo: Repository<Mushak63>,
    @InjectRepository(VdsCertificate)
    private readonly vdsRepo: Repository<VdsCertificate>,
    @InjectRepository(TaxFilingExport)
    private readonly exportRepo: Repository<TaxFilingExport>,
  ) {}

  async generateMushak91(
    tenantId: string,
    period: string,
  ): Promise<TaxFilingExport> {
    this.logger.log(
      `Generating Mushak 9.1 for tenant ${tenantId}, period ${period}`,
    );

    // period format: "YYYY-MM"
    const startDate = new Date(`${period}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 1. Aggregate Output Tax (Sales) from Mushak 6.3
    const sales = await this.mushak63Repo.find({
      where: {
        tenantId,
        issueDate: Between(startDate, endDate),
      },
    });

    const totalSalesValue = sales.reduce(
      (sum, s) => sum + Number(s.totalBaseAmount),
      0,
    );
    const totalOutputVat = sales.reduce(
      (sum, s) => sum + Number(s.totalVatAmount),
      0,
    );
    const totalOutputSd = sales.reduce(
      (sum, s) => sum + Number(s.totalSdAmount),
      0,
    );

    // 2. Aggregate Adjustments from VDS Certificates
    const vdsCerts = await this.vdsRepo.find({
      where: {
        tenantId,
        issueDate: Between(startDate, endDate),
      },
    });

    const decreasingAdjustments = vdsCerts.reduce(
      (sum, v) => sum + Number(v.deductedVatAmount),
      0,
    );

    // 3. Input Tax (Purchases) from procurement vendor bills
    const purchaseTax =
      await this.procurementService.getPurchaseInputTaxForPeriod(
        tenantId,
        startDate,
        endDate,
      );
    const totalPurchaseValue = purchaseTax.totalPurchaseValue;
    const totalInputVat = purchaseTax.totalInputVat;
    const totalInputSd = purchaseTax.totalInputSd;

    const netTaxPayable =
      totalOutputVat +
      totalOutputSd -
      (totalInputVat + totalInputSd) -
      decreasingAdjustments;

    const mushak91: Mushak91Dto = {
      period,
      totalSalesValue,
      totalOutputVat,
      totalOutputSd,
      totalPurchaseValue,
      totalInputVat,
      totalInputSd,
      increasingAdjustments: 0,
      decreasingAdjustments,
      netTaxPayable,
      status: 'DRAFT',
    };

    const record = this.exportRepo.create({
      tenantId,
      jurisdiction: 'BD',
      period,
      payload: mushak91,
      format: 'JSON',
    });

    return this.exportRepo.save(record);
  }

  async generateMushak63Pdf(tenantId: string, id: string): Promise<Buffer> {
    const mushak = await this.mushak63Repo.findOne({
      where: { id, tenantId },
      relations: ['items'],
    });

    if (!mushak) {
      throw new NotFoundException(`Mushak 6.3 with ID ${id} not found`);
    }

    const template = this.getMushak63Template();
    const data = {
      ...mushak,
      issueDate: mushak.issueDate.toLocaleDateString('en-GB'),
      items: mushak.items.map((item, index) => ({
        ...item,
        slNo: index + 1,
      })),
    };

    return this.pdfService.generatePdf(template, data);
  }

  async generateVdsCertificatePdf(
    tenantId: string,
    id: string,
  ): Promise<Buffer> {
    const cert = await this.vdsRepo.findOne({
      where: { id, tenantId },
    });

    if (!cert) {
      throw new NotFoundException(`VDS Certificate with ID ${id} not found`);
    }

    const template = this.getVdsCertificateTemplate();
    const data = {
      ...cert,
      issueDate: cert.issueDate.toLocaleDateString('en-GB'),
      referenceMushak63Date:
        cert.referenceMushak63Date.toLocaleDateString('en-GB'),
      treasuryChallanDate:
        cert.treasuryChallanDate?.toLocaleDateString('en-GB'),
    };

    return this.pdfService.generatePdf(template, data);
  }

  private getMushak63Template(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Siyam Rupali', Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .govt-text { font-weight: bold; font-size: 14px; }
        .form-name { font-weight: bold; font-size: 16px; margin: 10px 0; border: 1px solid #000; display: inline-block; padding: 5px 15px; }
        .info-section { width: 100%; margin-bottom: 20px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 5px; vertical-align: top; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .items-table th, .items-table td { border: 1px solid #000; padding: 5px; text-align: center; }
        .footer { margin-top: 50px; }
        .signature-box { float: right; width: 200px; text-align: center; border-top: 1px solid #000; padding-top: 5px; }
        .clear { clear: both; }
    </style>
</head>
<body>
    <div class="header">
        <div class="govt-text">Government of the People's Republic of Bangladesh</div>
        <div class="govt-text">National Board of Revenue</div>
        <div class="form-name">Mushak-6.3</div>
        <div>[See Rule 40(1)(C)]</div>
        <div style="font-weight: bold; font-size: 14px; margin-top: 10px;">Tax Invoice</div>
    </div>

    <table class="info-table">
        <tr>
            <td width="50%">
                <strong>Name of the Registered Person:</strong> {{sellerName}}<br>
                <strong>BIN of the Registered Person:</strong> {{sellerBin}}<br>
                <strong>Address:</strong> {{sellerAddress}}
            </td>
            <td width="50%" style="text-align: right;">
                <strong>Invoice Number:</strong> {{invoiceNumber}}<br>
                <strong>Date of Issue:</strong> {{issueDate}}<br>
                <strong>Time of Issue:</strong> {{createdAt}}
            </td>
        </tr>
    </table>

    <div style="margin-top: 10px;">
        <strong>Name of the Buyer:</strong> {{buyerName}}<br>
        <strong>BIN of the Buyer:</strong> {{buyerBin}}<br>
        <strong>Address of the Buyer:</strong> {{buyerAddress}}<br>
        <strong>Destination of Supply:</strong> {{buyerAddress}}<br>
        <strong>Vehicle Number:</strong> {{vehicleNumber}}
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th rowspan="2">Sl No.</th>
                <th rowspan="2">Name of Goods/Services (with HS Code where applicable)</th>
                <th rowspan="2">Unit of Supply</th>
                <th rowspan="2">Quantity</th>
                <th rowspan="2">Unit Price (Taka)</th>
                <th rowspan="2">Total Price (Taka)</th>
                <th colspan="2">Supplementary Duty</th>
                <th colspan="2">Value Added Tax</th>
                <th rowspan="2">Total Value Including All Taxes (Taka)</th>
            </tr>
            <tr>
                <th>Rate</th>
                <th>Amount (Taka)</th>
                <th>Rate</th>
                <th>Amount (Taka)</th>
            </tr>
        </thead>
        <tbody>
            {{#each items}}
            <tr>
                <td>{{slNo}}</td>
                <td style="text-align: left;">{{itemName}} ({{hsCode}})</td>
                <td>{{unitOfSupply}}</td>
                <td>{{quantity}}</td>
                <td>{{unitPrice}}</td>
                <td>{{totalPriceExclTax}}</td>
                <td>{{sdRate}}%</td>
                <td>{{sdAmount}}</td>
                <td>{{vatRate}}%</td>
                <td>{{vatAmount}}</td>
                <td>{{totalAmountInclTax}}</td>
            </tr>
            {{/each}}
        </tbody>
        <tfoot>
            <tr style="font-weight: bold;">
                <td colspan="5">Total</td>
                <td>{{totalBaseAmount}}</td>
                <td>-</td>
                <td>{{totalSdAmount}}</td>
                <td>-</td>
                <td>{{totalVatAmount}}</td>
                <td>{{totalAmountInclTax}}</td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <div class="signature-box">
            Name and Signature of Authorized Person with Seal
        </div>
        <div class="clear"></div>
    </div>
</body>
</html>
    `;
  }

  private getVdsCertificateTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Siyam Rupali', Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .govt-text { font-weight: bold; font-size: 14px; }
        .form-name { font-weight: bold; font-size: 16px; margin: 10px 0; border: 1px solid #000; display: inline-block; padding: 5px 15px; }
        .content { line-height: 1.6; }
        .footer { margin-top: 50px; }
        .signature-box { float: right; width: 200px; text-align: center; border-top: 1px solid #000; padding-top: 5px; }
        .clear { clear: both; }
    </style>
</head>
<body>
    <div class="header">
        <div class="govt-text">Government of the People's Republic of Bangladesh</div>
        <div class="govt-text">National Board of Revenue</div>
        <div class="form-name">Mushak-6.6</div>
        <div>[See Rule 40(1)(f)]</div>
        <div style="font-weight: bold; font-size: 14px; margin-top: 10px;">Certificate of Tax Deduction at Source</div>
    </div>

    <div class="content">
        <p>Certificate Number: <strong>{{certificateNumber}}</strong></p>
        <p>Date of Issue: <strong>{{issueDate}}</strong></p>

        <p>This is to certify that from the supplier <strong>{{supplierName}}</strong>, BIN: <strong>{{supplierBin}}</strong>, 
        against the Mushak-6.3 invoice number <strong>{{referenceMushak63No}}</strong> dated <strong>{{referenceMushak63Date}}</strong>, 
        the total amount of <strong>{{totalAmount}}</strong> (including VAT) was payable.</p>

        <p>Out of this amount, the VAT amount was <strong>{{vatAmount}}</strong>. 
        As per the VAT Act 2012, the amount of <strong>{{deductedVatAmount}}</strong> has been deducted at source.</p>

        {{#if treasuryChallanNo}}
        <p>The deducted amount has been deposited to the government treasury via Treasury Challan Number <strong>{{treasuryChallanNo}}</strong> 
        dated <strong>{{treasuryChallanDate}}</strong>.</p>
        {{/if}}
    </div>

    <div class="footer">
        <div class="signature-box">
            Name and Signature of Authorizing Officer with Seal
        </div>
        <div class="clear"></div>
    </div>
</body>
</html>
    `;
  }
}
