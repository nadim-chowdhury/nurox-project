import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import {
  PurchaseRequest,
  PurchaseRequestStatus,
} from './entities/purchase-request.entity';
import { Rfq, RfqStatus, VendorQuote } from './entities/rfq.entity';
import { PurchaseOrder, PoStatus } from './entities/purchase-order.entity';
import { Grn, GrnStatus, GrnLine } from './entities/grn.entity';
import { DebitNote } from './entities/debit-note.entity';
import { ApprovalMatrix } from './entities/approval-matrix.entity';
import { VendorEvaluation } from './entities/vendor-evaluation.entity';
import { VendorBill, VendorBillStatus } from './entities/vendor-bill.entity';
import { VendorBillLine } from './entities/vendor-bill-line.entity';
import { InventoryService } from '../inventory/inventory.service';
import { MailerService } from '../mailer/mailer.service';
import { FinanceService } from '../finance/finance.service';
import { CreateVendorBillDto } from '@repo/shared-schemas';
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
    @InjectRepository(ApprovalMatrix)
    private readonly matrixRepo: Repository<ApprovalMatrix>,
    @InjectRepository(VendorEvaluation)
    private readonly evaluationRepo: Repository<VendorEvaluation>,
    @InjectRepository(VendorBill)
    private readonly billRepo: Repository<VendorBill>,
    @InjectRepository(VendorBillLine)
    private readonly billLineRepo: Repository<VendorBillLine>,
    private readonly inventoryService: InventoryService,
    private readonly mailerService: MailerService,
    private readonly financeService: FinanceService,
    private readonly dataSource: DataSource,
  ) {}

  /** Bangladesh NBR-style VAT on purchases (SD on base, VAT on base+SD). */
  private calculatePurchaseLineTax(
    lineSubtotal: number,
    vatRatePercent: number,
    sdRatePercent: number,
  ) {
    const sdAmount = lineSubtotal * (sdRatePercent / 100);
    const vatAmount = (lineSubtotal + sdAmount) * (vatRatePercent / 100);
    return {
      sdAmount: Math.round(sdAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      lineTaxTotal: Math.round((sdAmount + vatAmount) * 100) / 100,
    };
  }

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
    const vendorIds = quotes.map((q) => q.vendorId);

    // Fetch average evaluation scores for these vendors
    const evaluations = await this.evaluationRepo
      .createQueryBuilder('e')
      .select('e.vendorId', 'vendorId')
      .addSelect('AVG(e.qualityScore)', 'avgQuality')
      .addSelect('AVG(e.deliveryScore)', 'avgDelivery')
      .where('e.vendorId IN (:...vendorIds)', {
        vendorIds: vendorIds.length
          ? vendorIds
          : ['00000000-0000-0000-0000-000000000000'],
      })
      .groupBy('e.vendorId')
      .getRawMany();

    const evalMap = new Map(
      evaluations.map((e) => [
        e.vendorId,
        { quality: Number(e.avgQuality), delivery: Number(e.avgDelivery) },
      ]),
    );

    return quotes.map((q) => ({
      vendorId: q.vendorId,
      totalAmount: q.totalAmount,
      currency: q.currency,
      lines: q.lines,
      qualityScore: evalMap.get(q.vendorId)?.quality || null,
      deliveryScore: evalMap.get(q.vendorId)?.delivery || null,
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
    const bills = await this.billRepo.find({
      where: { poId },
    });

    if (!po) throw new NotFoundException('PO not found');

    const mismatches: any[] = [];

    // 1. Quantity Match: PO vs GRN
    for (const poLine of po.lines) {
      const totalReceived = grns.reduce((sum, grn) => {
        const grnLine = grn.lines.find((gl) => gl.poLineId === poLine.id);
        return sum + Number(grnLine?.receivedQuantity || 0);
      }, 0);

      if (totalReceived !== Number(poLine.quantity)) {
        mismatches.push({
          type: 'QUANTITY_MISMATCH',
          productId: poLine.productId,
          poQuantity: poLine.quantity,
          receivedQuantity: totalReceived,
          difference: Number(poLine.quantity) - totalReceived,
        });
      }
    }

    // 2. Amount Match: PO vs Bill
    const totalBilled = bills.reduce(
      (sum, b) => sum + Number(b.totalAmount),
      0,
    );
    if (totalBilled > 0 && totalBilled !== Number(po.grandTotal)) {
      mismatches.push({
        type: 'AMOUNT_MISMATCH',
        poTotal: po.grandTotal,
        billedTotal: totalBilled,
        difference: Number(po.grandTotal) - totalBilled,
      });
    }

    return {
      poId,
      poNumber: po.poNumber,
      isMatch: mismatches.length === 0,
      mismatches,
    };
  }

  async checkPRApproval(prId: string) {
    const pr = await this.prRepo.findOne({ where: { id: prId } });
    if (!pr) throw new NotFoundException('PR not found');

    const matrixRules = await this.matrixRepo.find({
      where: [{ departmentId: pr.departmentId }, { departmentId: IsNull() }],
    });

    const requiredApprovers = matrixRules
      .filter((rule) => {
        const minMatches =
          Number(pr.totalEstimatedCost) >= Number(rule.minAmount);
        const maxMatches =
          rule.maxAmount === null ||
          Number(pr.totalEstimatedCost) <= Number(rule.maxAmount);
        return minMatches && maxMatches;
      })
      .map((rule) => rule.requiredRole);

    return {
      prId: pr.id,
      amount: pr.totalEstimatedCost,
      requiredRoles: Array.from(new Set(requiredApprovers)),
    };
  }

  async cancelPurchaseOrder(
    poId: string,
    reason: string,
    lineItemsToCancel?: { poLineId: string; quantity: number }[],
  ) {
    return this.dataSource.transaction(async (manager) => {
      const po = await manager.findOne(PurchaseOrder, {
        where: { id: poId },
        relations: ['lines'],
      });
      if (!po) throw new NotFoundException('PO not found');

      if (!lineItemsToCancel || lineItemsToCancel.length === 0) {
        // Full cancellation
        po.status = PoStatus.CANCELLED;
        po.cancellationReason = reason;
        for (const line of po.lines) {
          line.cancelledQuantity =
            Number(line.quantity) - Number(line.receivedQuantity);
        }
      } else {
        // Partial cancellation
        for (const req of lineItemsToCancel) {
          const line = po.lines.find((l) => l.id === req.poLineId);
          if (line) {
            line.cancelledQuantity =
              Number(line.cancelledQuantity) + req.quantity;
          }
        }
        po.cancellationReason = `Partial Cancel: ${reason}`;
      }

      return manager.save(po);
    });
  }

  async inspectGrn(
    grnId: string,
    inspections: {
      grnLineId: string;
      acceptedQuantity: number;
      rejectedQuantity: number;
    }[],
  ) {
    return this.dataSource.transaction(async (manager) => {
      const grn = await manager.findOne(Grn, {
        where: { id: grnId },
        relations: ['lines'],
      });
      if (!grn) throw new NotFoundException('GRN not found');

      for (const ins of inspections) {
        const line = grn.lines.find((l) => l.id === ins.grnLineId);
        if (line) {
          line.acceptedQuantity = ins.acceptedQuantity;
          line.rejectedQuantity = ins.rejectedQuantity;

          // Optionally auto-create quarantine stock movement for rejected items here
          if (ins.rejectedQuantity > 0) {
            // Placeholder: move rejected to quarantine bin
            this.logger.warn(
              `Rejected ${ins.rejectedQuantity} items for GRN line ${line.id} - sending to Quarantine`,
            );
          }
        }
      }

      return manager.save(grn);
    });
  }

  async createVendorBill(tenantId: string, dto: CreateVendorBillDto) {
    return this.dataSource.transaction(async (manager) => {
      const po = await manager.findOne(PurchaseOrder, {
        where: { id: dto.poId, tenantId },
        relations: ['lines', 'vendor'],
      });
      if (!po) throw new NotFoundException('Purchase order not found');
      if (po.vendorId !== dto.vendorId) {
        throw new BadRequestException('Vendor does not match purchase order');
      }

      if (dto.grnId) {
        const grn = await manager.findOne(Grn, {
          where: { id: dto.grnId, tenantId, poId: dto.poId },
        });
        if (!grn) {
          throw new BadRequestException(
            'GRN not found for this purchase order',
          );
        }
      }

      const existing = await manager.findOne(VendorBill, {
        where: { tenantId, billNumber: dto.billNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Vendor bill number ${dto.billNumber} already exists`,
        );
      }

      let subTotal = 0;
      let vatTotal = 0;
      let sdTotal = 0;
      let taxTotal = 0;

      const lineEntities: VendorBillLine[] = [];

      for (const line of dto.lines) {
        const lineSubtotal = line.quantity * line.unitCost;
        const tax = this.calculatePurchaseLineTax(
          lineSubtotal,
          line.vatRate ?? 15,
          line.sdRate ?? 0,
        );

        subTotal += lineSubtotal;
        vatTotal += tax.vatAmount;
        sdTotal += tax.sdAmount;
        taxTotal += tax.lineTaxTotal;

        if (line.poLineId) {
          const poLine = po.lines.find((pl) => pl.id === line.poLineId);
          if (!poLine) {
            throw new BadRequestException(
              `PO line ${line.poLineId} not found on purchase order`,
            );
          }
          if (line.quantity > Number(poLine.quantity)) {
            throw new BadRequestException(
              `Bill quantity exceeds PO quantity for line ${line.poLineId}`,
            );
          }
        }

        lineEntities.push(
          manager.create(VendorBillLine, {
            tenantId,
            productId: line.productId ?? null,
            poLineId: line.poLineId ?? null,
            description: line.description,
            quantity: line.quantity,
            unitCost: line.unitCost,
            lineSubtotal,
            vatRate: line.vatRate ?? 15,
            sdRate: line.sdRate ?? 0,
            vatAmount: tax.vatAmount,
            sdAmount: tax.sdAmount,
            lineTaxTotal: tax.lineTaxTotal,
          }),
        );
      }

      const totalAmount = subTotal + taxTotal;

      const bill = manager.create(VendorBill, {
        tenantId,
        vendorId: dto.vendorId,
        poId: dto.poId,
        grnId: dto.grnId ?? null,
        billNumber: dto.billNumber,
        billDate: new Date(dto.billDate),
        dueDate: new Date(dto.dueDate),
        currency: dto.currency,
        subTotal,
        vatTotal,
        sdTotal,
        taxTotal,
        totalAmount,
        status: VendorBillStatus.DRAFT,
        notes: dto.notes ?? null,
        lines: lineEntities,
      });

      const saved = await manager.save(bill);
      return manager.findOne(VendorBill, {
        where: { id: saved.id, tenantId },
        relations: ['lines', 'vendor', 'purchaseOrder'],
      });
    });
  }

  async findVendorBills(tenantId: string, status?: VendorBillStatus) {
    return this.billRepo.find({
      where: status ? { tenantId, status } : { tenantId },
      relations: ['lines', 'vendor'],
      order: { billDate: 'DESC' },
    });
  }

  async getVendorBill(tenantId: string, id: string) {
    const bill = await this.billRepo.findOne({
      where: { id, tenantId },
      relations: ['lines', 'vendor', 'purchaseOrder', 'grn'],
    });
    if (!bill) throw new NotFoundException('Vendor bill not found');
    return bill;
  }

  async submitVendorBill(tenantId: string, id: string) {
    const bill = await this.getVendorBill(tenantId, id);
    if (bill.status !== VendorBillStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT vendor bills can be submitted');
    }

    const match = await this.verifyThreeWayMatch(bill.poId);
    if (!match.isMatch) {
      this.logger.warn(
        `Three-way match warnings for PO ${bill.poId}: ${JSON.stringify(match.mismatches)}`,
      );
    }

    const vendor = await this.vendorRepo.findOne({
      where: { id: bill.vendorId, tenantId },
    });

    const financeBill = await this.financeService.createBill({
      billNumber: bill.billNumber,
      vendorName: vendor?.name ?? 'Vendor',
      vendorId: bill.vendorId,
      issueDate: bill.billDate.toISOString().slice(0, 10),
      dueDate: bill.dueDate.toISOString().slice(0, 10),
      currency: bill.currency,
      purchaseOrderId: bill.poId,
      grnId: bill.grnId,
      subtotal: bill.subTotal,
      taxAmount: bill.taxTotal,
      totalAmount: bill.totalAmount,
      lines: bill.lines.map((line) => ({
        description: line.description,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitCost),
        taxAmount: Number(line.lineTaxTotal),
      })),
    });

    bill.status = VendorBillStatus.PENDING_PAYMENT;
    bill.financeBillId = financeBill.id;
    return this.billRepo.save(bill);
  }

  async markVendorBillPaid(tenantId: string, id: string) {
    const bill = await this.getVendorBill(tenantId, id);
    if (bill.status !== VendorBillStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        'Only PENDING_PAYMENT bills can be marked paid',
      );
    }
    bill.status = VendorBillStatus.PAID;
    return this.billRepo.save(bill);
  }

  async cancelVendorBill(tenantId: string, id: string) {
    const bill = await this.getVendorBill(tenantId, id);
    if (bill.status === VendorBillStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid vendor bill');
    }
    bill.status = VendorBillStatus.CANCELLED;
    return this.billRepo.save(bill);
  }

  /**
   * Aggregates purchase input VAT/SD for Mushak 9.1 and VAT return reports.
   */
  async getPurchaseInputTaxForPeriod(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const statuses = [VendorBillStatus.PENDING_PAYMENT, VendorBillStatus.PAID];

    const result = await this.billLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.vendorBill', 'bill')
      .where('bill.tenant_id = :tenantId', { tenantId })
      .andWhere('bill.billDate >= :startDate', { startDate })
      .andWhere('bill.billDate < :endDate', { endDate })
      .andWhere('bill.status IN (:...statuses)', { statuses })
      .select('COALESCE(SUM(line.lineSubtotal), 0)', 'purchaseValue')
      .addSelect('COALESCE(SUM(line.vatAmount), 0)', 'inputVat')
      .addSelect('COALESCE(SUM(line.sdAmount), 0)', 'inputSd')
      .getRawOne();

    return {
      totalPurchaseValue: Number(result?.purchaseValue) || 0,
      totalInputVat: Number(result?.inputVat) || 0,
      totalInputSd: Number(result?.inputSd) || 0,
    };
  }

  async getSpendAnalytics() {
    const pos = await this.poRepo.find({
      where: { status: PoStatus.CLOSED }, // or fully received
      relations: ['vendor'],
    });

    const spendByVendor = pos.reduce(
      (acc, po) => {
        const vName = po.vendor.name;
        acc[vName] = (acc[vName] || 0) + Number(po.grandTotal);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Grouping by month for time series
    const spendOverTime = pos.reduce(
      (acc, po) => {
        const month = po.orderDate.toISOString().substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + Number(po.grandTotal);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      spendByVendor: Object.entries(spendByVendor).map(([name, value]) => ({
        name,
        value,
      })),
      spendOverTime: Object.entries(spendOverTime)
        .map(([month, value]) => ({ month, value }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      totalSpend: pos.reduce((sum, po) => sum + Number(po.grandTotal), 0),
    };
  }
}
