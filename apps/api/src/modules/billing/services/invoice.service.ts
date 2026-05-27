import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import { Invoice } from '../entities/invoice.entity';
import { Tenant } from '../../system/entities/tenant.entity';
import * as fs from 'fs';
import * as path from 'path';
// Assuming there's some S3/MinIO service, we mock it for now.
// import { S3Service } from '../../common/services/s3.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateInvoicePdf(invoice: Invoice, tenant: Tenant): Promise<string> {
    this.logger.log(`Generating PDF for invoice ${invoice.id}`);

    const templateSource = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #00b96b; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #1B2A4A; }
          .invoice-details { text-align: right; }
          .bill-to { margin-top: 40px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 40px; }
          .table th, .table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
          .table th { background-color: #f9f9f9; }
          .total { margin-top: 40px; text-align: right; font-size: 20px; font-weight: bold; color: #00b96b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Nurox ERP</div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p>Invoice #: {{invoice.id}}</p>
            <p>Date: {{invoice.createdAt}}</p>
          </div>
        </div>
        <div class="bill-to">
          <h3>Bill To:</h3>
          <p><strong>{{tenant.name}}</strong></p>
          <p>{{tenant.email}}</p>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SaaS Subscription Plan</td>
              <td>{{invoice.currency}} {{invoice.amountDue}}</td>
            </tr>
          </tbody>
        </table>
        <div class="total">
          Total Due: {{invoice.currency}} {{invoice.amountDue}}
        </div>
      </body>
      </html>
    `;

    const template = handlebars.compile(templateSource);
    const html = template({
      invoice: {
        ...invoice,
        createdAt: invoice.createdAt.toLocaleDateString(),
      },
      tenant,
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Instead of uploading, we'll save it locally for now (mocking S3)
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const fileName = `invoice_${invoice.id}.pdf`;
    const tempPath = path.join(process.cwd(), 'temp', fileName);

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'));
    }

    fs.writeFileSync(tempPath, pdfBuffer);

    // In a real scenario, we'd upload to MinIO/S3 and return the URL
    // const pdfUrl = await this.s3Service.upload('invoices', fileName, pdfBuffer);
    // return pdfUrl;

    const mockPdfUrl = `${this.configService.get('app.apiUrl')}/temp/${fileName}`;
    this.logger.log(`Invoice PDF generated: ${mockPdfUrl}`);
    return mockPdfUrl;
  }
}
