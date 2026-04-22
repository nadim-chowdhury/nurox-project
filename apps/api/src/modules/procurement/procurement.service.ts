import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import {
  PurchaseRequest,
  PurchaseRequestStatus,
} from './entities/purchase-request.entity';
import { Rfq, RfqStatus, VendorQuote } from './entities/rfq.entity';
import { PurchaseOrder, PoStatus } from './entities/purchase-order.entity';
import { Grn, GrnStatus, GrnLine } from './entities/grn.entity';
import { DebitNote } from './entities/debit-note.entity';
import { InventoryService } from '../inventory/inventory.service';
import { MailerService } from '../mailer/mailer.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ProcurementService {
  private readonly logger = new Logger(ProcurementService.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(PurchaseRequest)
    private readonly prRepo: Repository<PurchaseRequest>,
    @InjectRepository(Rfq)
    private readonly rfqRepo: Repository<Rfq>,
    @InjectRepository(VendorQuote)
    private readonly quoteRepo: Repository<VendorQuote>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(Grn)
    private readonly grnRepo: Repository<Grn>,
    @InjectRepository(DebitNote)
    private readonly debitNoteRepo: Repository<DebitNote>,
    private readonly inventoryService: InventoryService,
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
  ) {}

  async createVendor(dto: any) {
    const vendor = this.vendorRepo.create(dto as object);
    return this.vendorRepo.save(vendor);
  }

  async findAllVendors() {
    return this.vendorRepo.find();
  }

  async createPR(dto: any) {
    const pr = this.prRepo.create({
      ...(dto as object),
      prNumber: `PR-${Date.now()}`,
      status: PurchaseRequestStatus.DRAFT,
    });
    return this.prRepo.save(pr);
  }

  async createRFQ(dto: { prId: string; vendorIds: string[]; deadline: Date }) {
    const pr = await this.prRepo.findOne({
      where: { id: dto.prId },
      relations: ['lines'],
    });
    if (!pr) throw new NotFoundException('PR not found');

    const rfq = this.rfqRepo.create({
      rfqNumber: `RFQ-${Date.now()}`,
      status: RfqStatus.DRAFT,
      deadline: dto.deadline,
      vendors: dto.vendorIds.map((id) => ({ id }) as Vendor),
    });
    const savedRfq = await this.rfqRepo.save(rfq);

    pr.status = PurchaseRequestStatus.CONVERTED_TO_RFQ;
    await this.prRepo.save(pr);

    return savedRfq;
  }

  async submitQuote(dto: any) {
    const quote = this.quoteRepo.create(dto as object);
    return this.quoteRepo.save(quote);
  }

  async getRfqComparison(rfqId: string) {
    const quotes = await this.quoteRepo.find({ where: { rfqId } });
    return quotes.map((q) => ({
      vendorId: q.vendorId,
      totalAmount: q.totalAmount,
      currency: q.currency,
      lines: q.lines,
    }));
  }

  async createPO(dto: any) {
    return this.dataSource.transaction(async (manager) => {
      const vendorId = (dto as { vendorId: string }).vendorId;
      const vendor = await manager.findOne(Vendor, { where: { id: vendorId } });
      if (!vendor) throw new NotFoundException('Vendor not found');

      const grandTotal = (dto as { grandTotal: number }).grandTotal;
      // Credit limit check
      if (vendor.creditLimit > 0 && grandTotal > vendor.creditLimit) {
        throw new BadRequestException(
          `Order exceeds vendor credit limit of ${vendor.creditLimit}`,
        );
      }

      const po = manager.create(PurchaseOrder, {
        ...(dto as object),
        poNumber: `PO-${Date.now()}`,
        status: PoStatus.DRAFT,
        version: 1,
      });
      return manager.save(po);
    });
  }

  async sendPOByEmail(poId: string) {
    const po = await this.poRepo.findOne({
      where: { id: poId },
      relations: ['vendor', 'lines', 'lines.product'],
    });
    if (!po || !po.vendor)
      throw new NotFoundException('PO or Vendor not found');
    if (!po.vendor.email) throw new BadRequestException('Vendor email not set');

    const pdfBuffer = await this.generatePoPdf(po);

    await this.mailerService.sendMail({
      to: po.vendor.email,
      subject: `Purchase Order ${po.poNumber}`,
      html: `<p>Dear Vendor,</p><p>Please find attached our Purchase Order ${po.poNumber}.</p>`,
      attachments: [
        {
          filename: `${po.poNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    po.status = PoStatus.SENT;
    await this.poRepo.save(po);
  }

  async generatePoPdf(po: PurchaseOrder): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const htmlContent = `
      <html>
        <body>
          <h1>Purchase Order: ${po.poNumber}</h1>
          <p>Vendor: ${po.vendor.name}</p>
          <p>Date: ${po.orderDate.toISOString()}</p>
          <table border="1" width="100%">
            <tr><th>Product</th><th>Quantity</th><th>Unit Cost</th><th>Total</th></tr>
            ${po.lines
              .map(
                (l) => `
              <tr>
                <td>${l.product.name}</td>
                <td>${l.quantity}</td>
                <td>${l.unitCost}</td>
                <td>${l.totalAmount}</td>
              </tr>
            `,
              )
              .join('')}
          </table>
          <h3>Grand Total: ${po.grandTotal} ${po.currency}</h3>
        </body>
      </html>
    `;
    await page.setContent(htmlContent);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    return Buffer.from(pdf);
  }

  async createGRN(dto: any) {
    return this.dataSource.transaction(async (manager) => {
      const poId = (dto as { poId: string }).poId;
      const po = await manager.findOne(PurchaseOrder, {
        where: { id: poId },
        relations: ['lines'],
      });
      if (!po) throw new NotFoundException('PO not found');

      const grn = manager.create(Grn, {
        ...(dto as object),
        grnNumber: `GRN-${Date.now()}`,
        status: GrnStatus.COMPLETED,
      });
      const savedGrn = await manager.save(grn);

      const lines = (dto as { lines: any[] }).lines;
      // Update PO received quantities and inventory
      for (const line of lines) {
        const poLine = po.lines.find((l) => l.id === line.poLineId);
        if (poLine) {
          poLine.receivedQuantity =
            Number(poLine.receivedQuantity) + Number(line.receivedQuantity);
          await manager.save(poLine);
        }

        await this.inventoryService.receiveStock({
          productId: line.productId as string,
          variantId: line.variantId as string,
          warehouseId: line.warehouseId as string,
          binId: line.binId as string,
          batchNumber:
            (line.batchNumber as string) || `GRN-${savedGrn.grnNumber}`,
          expiryDate: line.expiryDate
            ? new Date(line.expiryDate as string)
            : undefined,
          quantity: line.receivedQuantity as number,
          unitCost:
            (line.unitCost as number) || (poLine?.unitCost as number) || 0,
          reference: savedGrn.grnNumber,
        });
      }

      // Check if PO is fully received
      const allReceived = po.lines.every(
        (l) => Number(l.receivedQuantity) >= Number(l.quantity),
      );
      po.status = allReceived
        ? PoStatus.FULLY_RECEIVED
        : PoStatus.PARTIALLY_RECEIVED;
      await manager.save(po);

      return savedGrn;
    });
  }

  async amendPO(poId: string, dto: any) {
    const po = await this.poRepo.findOne({
      where: { id: poId },
      relations: ['lines'],
    });
    if (!po) throw new NotFoundException('PO not found');

    // Save history
    if (!po.history) po.history = [];
    po.history.push({
      version: po.version,
      date: new Date(),
      data: { ...po, lines: [...po.lines] },
    });

    po.version += 1;
    Object.assign(po, dto as object);
    return this.poRepo.save(po);
  }

  async allocateLandedCost(
    grnId: string,
    costs: { type: string; amount: number }[],
  ) {
    const grn = await this.grnRepo.findOne({
      where: { id: grnId },
      relations: ['lines'],
    });
    if (!grn) throw new NotFoundException('GRN not found');

    const totalCost = costs.reduce((sum, c) => sum + c.amount, 0);
    const totalQty = grn.lines.reduce(
      (sum, l) => sum + Number(l.receivedQuantity),
      0,
    );

    // Allocate cost by quantity (simple allocation)
    for (const line of grn.lines) {
      const allocatedAmount =
        (Number(line.receivedQuantity) / totalQty) * totalCost;
      line.unitCost =
        Number(line.unitCost || 0) +
        allocatedAmount / Number(line.receivedQuantity);
      await this.dataSource.getRepository(GrnLine).save(line);
    }
    return grn;
  }

  async createPurchaseReturn(dto: {
    vendorId: string;
    grnId?: string;
    poId?: string;
    items: {
      productId: string;
      variantId?: string;
      warehouseId: string;
      quantity: number;
    }[];
    reason: string;
  }) {
    return this.dataSource.transaction(async (manager) => {
      let totalAmount = 0;

      for (const item of dto.items) {
        // Issue stock back out
        await this.inventoryService.issueStock({
          productId: item.productId,
          variantId: item.variantId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          reasonCode: 'PURCHASE_RETURN',
          reference: `RETURN-${dto.reason}`,
        });

        // Calculate amount for debit note (simplified: using product unit cost)
        const product = await manager.findOne('Product' as any, {
          where: { id: item.productId },
        });
        totalAmount += Number((product as any)?.basePrice || 0) * item.quantity;
      }

      const debitNote = manager.create(DebitNote, {
        vendorId: dto.vendorId,
        grnId: dto.grnId,
        poId: dto.poId,
        amount: totalAmount,
        reason: dto.reason,
        date: new Date(),
      });
      return manager.save(debitNote);
    });
  }

  async getVendorScorecard(vendorId: string) {
    const pos = await this.poRepo.find({ where: { vendorId } });
    const grns = await this.grnRepo.find({
      where: { purchaseOrder: { vendorId } },
      relations: ['purchaseOrder'],
    });

    const totalSpent = pos.reduce((sum, po) => sum + Number(po.grandTotal), 0);
    const totalOrders = pos.length;

    // Calculate average lead time
    let totalLeadTime = 0;
    let receivedOrders = 0;
    grns.forEach((grn) => {
      if (grn.purchaseOrder) {
        const leadTime =
          grn.receivedDate.getTime() - grn.purchaseOrder.orderDate.getTime();
        totalLeadTime += leadTime;
        receivedOrders++;
      }
    });

    const avgLeadTimeDays =
      receivedOrders > 0
        ? totalLeadTime / (1000 * 60 * 60 * 24) / receivedOrders
        : 0;

    return {
      vendorId,
      totalSpent,
      totalOrders,
      avgLeadTimeDays,
      orderFulfillmentRate:
        totalOrders > 0 ? (receivedOrders / totalOrders) * 100 : 0,
    };
  }

  async verifyThreeWayMatch(poId: string) {
    const po = await this.poRepo.findOne({
      where: { id: poId },
      relations: ['lines'],
    });
    const grns = await this.grnRepo.find({
      where: { poId },
      relations: ['lines'],
    });

    if (!po) throw new NotFoundException('PO not found');

    const mismatches: any[] = [];

    for (const poLine of po.lines) {
      const totalReceived = grns.reduce((sum, grn) => {
        const grnLine = grn.lines.find((gl) => gl.poLineId === poLine.id);
        return sum + Number(grnLine?.receivedQuantity || 0);
      }, 0);

      if (totalReceived !== Number(poLine.quantity)) {
        mismatches.push({
          productId: poLine.productId,
          poQuantity: poLine.quantity,
          receivedQuantity: totalReceived,
          difference: Number(poLine.quantity) - totalReceived,
        });
      }
    }

    return {
      poId,
      poNumber: po.poNumber,
      isMatch: mismatches.length === 0,
      mismatches,
    };
  }
}
