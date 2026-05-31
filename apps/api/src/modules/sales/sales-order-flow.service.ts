import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Quotation,
  QuotationStatus,
  QuotationLine,
} from './entities/quotation.entity';
import {
  SalesOrder,
  SOStatus,
  SalesOrderLine,
} from './entities/sales-order.entity';
import {
  DeliveryOrder,
  DOStatus,
  DeliveryOrderLine,
} from './entities/delivery-order.entity';
import { Account } from './entities/account.entity';
import { Product } from '../inventory/entities/product.entity';
import { FinanceService } from '../finance/finance.service';
import { MushakService } from '../compliance/services/mushak.service';
import { InventoryService } from '../inventory/inventory.service';
import { InvoiceStatus } from '../finance/entities/invoice.entity';
import {
  CreateQuotationDto,
  CreateAccountDto,
  InvoiceFromSalesOrderDto,
  CreateDeliveryOrderDto,
} from '@repo/shared-schemas';

export interface SalesLineTaxBreakdown {
  lineSubtotal: number;
  sdAmount: number;
  vatAmount: number;
  lineTaxTotal: number;
  lineTotalInclTax: number;
}

@Injectable()
export class SalesOrderFlowService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepo: Repository<Quotation>,
    @InjectRepository(SalesOrder)
    private readonly soRepo: Repository<SalesOrder>,
    @InjectRepository(DeliveryOrder)
    private readonly doRepo: Repository<DeliveryOrder>,
    @InjectRepository(DeliveryOrderLine)
    private readonly doLineRepo: Repository<DeliveryOrderLine>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly financeService: FinanceService,
    private readonly mushakService: MushakService,
    private readonly inventoryService: InventoryService,
  ) {}

  async createAccount(
    tenantId: string,
    dto: CreateAccountDto,
  ): Promise<Account> {
    const account = this.accountRepo.create({
      tenantId,
      name: dto.name,
      industry: dto.industry ?? null,
      website: dto.website ?? null,
      annualRevenue: dto.annualRevenue ?? null,
      taxBin: dto.taxBin ?? null,
      billingAddress: dto.billingAddress ?? null,
    });
    return this.accountRepo.save(account);
  }

  async listAccounts(tenantId: string): Promise<Account[]> {
    return this.accountRepo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  calculateLineTax(
    quantity: number,
    unitPrice: number,
    discountPercent: number,
    vatPercent: number,
    sdPercent: number,
  ): SalesLineTaxBreakdown {
    const lineSubtotal =
      quantity * unitPrice * (1 - (discountPercent || 0) / 100);
    const sdAmount = lineSubtotal * ((sdPercent || 0) / 100);
    const vatAmount = (lineSubtotal + sdAmount) * ((vatPercent || 0) / 100);
    const lineTaxTotal = sdAmount + vatAmount;
    return {
      lineSubtotal: Math.round(lineSubtotal * 100) / 100,
      sdAmount: Math.round(sdAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      lineTaxTotal: Math.round(lineTaxTotal * 100) / 100,
      lineTotalInclTax: Math.round((lineSubtotal + lineTaxTotal) * 100) / 100,
    };
  }

  async createQuotation(
    tenantId: string,
    dto: CreateQuotationDto,
  ): Promise<Quotation> {
    const lines = dto.lines.map((line) =>
      this.quotationRepo.manager.create(QuotationLine, {
        tenantId,
        productId: line.productId,
        variantId: line.variantId ?? null,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent ?? 0,
        taxPercent: line.taxPercent ?? 15,
      }),
    );

    const quotation = this.quotationRepo.create({
      tenantId,
      accountId: dto.accountId ?? null,
      contactId: dto.contactId ?? null,
      dealId: dto.dealId ?? null,
      quotationNumber: dto.quotationNumber ?? `QT-${Date.now()}`,
      version: dto.version ?? 1,
      status: (dto.status as QuotationStatus) ?? QuotationStatus.DRAFT,
      issueDate: new Date(dto.issueDate),
      validUntil: new Date(dto.validUntil),
      currency: dto.currency ?? 'USD',
      lines,
    });

    return this.quotationRepo.save(quotation);
  }

  async sendQuotation(
    tenantId: string,
    quotationId: string,
  ): Promise<Quotation> {
    const qt = await this.getQuotation(tenantId, quotationId);
    if (qt.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT quotations can be sent');
    }
    qt.status = QuotationStatus.SENT;
    return this.quotationRepo.save(qt);
  }

  async getQuotation(tenantId: string, id: string): Promise<Quotation> {
    const qt = await this.quotationRepo.findOne({
      where: { id, tenantId },
      relations: ['lines', 'account'],
    });
    if (!qt) throw new NotFoundException('Quotation not found');
    return qt;
  }

  async listQuotations(tenantId: string): Promise<Quotation[]> {
    return this.quotationRepo.find({
      where: { tenantId },
      relations: ['lines', 'account'],
      order: { createdAt: 'DESC' },
    });
  }

  async convertQuotationToSalesOrder(
    tenantId: string,
    quotationId: string,
  ): Promise<SalesOrder> {
    const qt = await this.getQuotation(tenantId, quotationId);
    if (
      qt.status !== QuotationStatus.SENT &&
      qt.status !== QuotationStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Quotation must be DRAFT or SENT to convert to sales order',
      );
    }
    if (!qt.accountId) {
      throw new BadRequestException(
        'Quotation must have an account before conversion',
      );
    }

    let subTotal = 0;
    let vatTotal = 0;
    let sdTotal = 0;
    let taxTotal = 0;

    const soLines = qt.lines.map((l) => {
      const tax = this.calculateLineTax(
        Number(l.quantity),
        Number(l.unitPrice),
        Number(l.discountPercent),
        Number(l.taxPercent),
        0,
      );
      subTotal += tax.lineSubtotal;
      vatTotal += tax.vatAmount;
      sdTotal += tax.sdAmount;
      taxTotal += tax.lineTaxTotal;

      return this.soRepo.manager.create(SalesOrderLine, {
        tenantId,
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        taxPercent: l.taxPercent,
        deliveredQuantity: 0,
        invoicedQuantity: 0,
      });
    });

    const so = this.soRepo.create({
      tenantId,
      quotationId: qt.id,
      accountId: qt.accountId,
      soNumber: `SO-${Date.now()}`,
      status: SOStatus.DRAFT,
      orderDate: new Date(),
      currency: qt.currency,
      subTotal,
      vatTotal,
      sdTotal,
      taxTotal,
      totalAmount: subTotal + taxTotal,
      lines: soLines,
    });

    qt.status = QuotationStatus.ACCEPTED;
    await this.quotationRepo.save(qt);

    return this.soRepo.save(so);
  }

  async getSalesOrder(tenantId: string, id: string): Promise<SalesOrder> {
    const so = await this.soRepo.findOne({
      where: { id, tenantId },
      relations: ['lines', 'account', 'quotation'],
    });
    if (!so) throw new NotFoundException('Sales order not found');
    return so;
  }

  async listSalesOrders(tenantId: string): Promise<SalesOrder[]> {
    return this.soRepo.find({
      where: { tenantId },
      relations: ['lines', 'account'],
      order: { orderDate: 'DESC' },
    });
  }

  async confirmSalesOrder(tenantId: string, id: string): Promise<SalesOrder> {
    const so = await this.getSalesOrder(tenantId, id);
    if (so.status !== SOStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT sales orders can be confirmed');
    }
    so.status = SOStatus.CONFIRMED;
    return this.soRepo.save(so);
  }

  async createInvoiceFromSalesOrder(
    tenantId: string,
    salesOrderId: string,
    dto: InvoiceFromSalesOrderDto,
  ) {
    const so = await this.getSalesOrder(tenantId, salesOrderId);

    if (so.status === SOStatus.INVOICED) {
      throw new ConflictException('Sales order is already invoiced');
    }
    if (
      so.status !== SOStatus.CONFIRMED &&
      so.status !== SOStatus.DELIVERED &&
      so.status !== SOStatus.PARTIALLY_DELIVERED
    ) {
      throw new BadRequestException(
        'Sales order must be CONFIRMED or delivered before invoicing',
      );
    }

    const account = await this.accountRepo.findOne({
      where: { id: so.accountId, tenantId },
    });

    const productIds = so.lines.map((l) => l.productId);
    const products =
      productIds.length > 0
        ? await this.productRepo.find({
            where: { id: In(productIds), tenantId },
          })
        : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subTotal = 0;
    let vatTotal = 0;
    let sdTotal = 0;
    let taxTotal = 0;

    const mushakItems: Array<{
      itemName: string;
      hsCode?: string;
      unitOfSupply: string;
      quantity: number;
      unitPrice: number;
      totalPriceExclTax: number;
      sdRate: number;
      sdAmount: number;
      vatRate: number;
      vatAmount: number;
      totalAmountInclTax: number;
    }> = [];

    const invoiceLines: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const line of so.lines) {
      const qty = Number(line.quantity);
      const unitPrice = Number(line.unitPrice);
      const tax = this.calculateLineTax(
        qty,
        unitPrice,
        Number(line.discountPercent),
        Number(line.taxPercent),
        0,
      );

      subTotal += tax.lineSubtotal;
      vatTotal += tax.vatAmount;
      sdTotal += tax.sdAmount;
      taxTotal += tax.lineTaxTotal;

      const product = productMap.get(line.productId);
      const itemName = product?.name ?? `Product ${line.productId}`;

      mushakItems.push({
        itemName,
        hsCode: product?.sku,
        unitOfSupply: 'PCS',
        quantity: qty,
        unitPrice: tax.lineSubtotal / qty,
        totalPriceExclTax: tax.lineSubtotal,
        sdRate: 0,
        sdAmount: tax.sdAmount,
        vatRate: Number(line.taxPercent),
        vatAmount: tax.vatAmount,
        totalAmountInclTax: tax.lineTotalInclTax,
      });

      invoiceLines.push({
        description: itemName,
        quantity: qty,
        unitPrice: tax.lineSubtotal / qty,
      });

      line.invoicedQuantity = qty;
    }

    const totalAmount = subTotal + taxTotal;
    const invoiceNumber = `INV-${so.soNumber}`;
    const issueDate = new Date();
    const dueDate = dto.dueDate
      ? new Date(dto.dueDate)
      : new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const buyerName = dto.buyerName ?? account?.name ?? 'Customer';
    const buyerBin = dto.buyerBin ?? account?.taxBin ?? undefined;
    const buyerAddress =
      dto.buyerAddress ?? account?.billingAddress ?? 'Address not provided';

    const invoice = await this.financeService.createInvoice({
      invoiceNumber,
      customerName: buyerName,
      customerId: so.accountId,
      issueDate: issueDate.toISOString().slice(0, 10),
      dueDate: dueDate.toISOString().slice(0, 10),
      status: InvoiceStatus.SENT,
      isProforma: false,
      isTaxInvoice: true,
      subtotal: subTotal,
      taxAmount: taxTotal,
      totalAmount,
      lines: invoiceLines,
      notes: `Generated from sales order ${so.soNumber}`,
    } as never);

    const mushak = await this.mushakService.createMushak63(tenantId, {
      invoiceNumber,
      issueDate: issueDate.toISOString(),
      sellerName: dto.sellerName,
      sellerBin: dto.sellerBin,
      sellerAddress: dto.sellerAddress,
      buyerName,
      buyerBin,
      buyerAddress,
      vehicleNumber: dto.vehicleNumber,
      totalBaseAmount: subTotal,
      totalSdAmount: sdTotal,
      totalVatAmount: vatTotal,
      totalAmountInclTax: totalAmount,
      items: mushakItems,
    });

    so.status = SOStatus.INVOICED;
    so.subTotal = subTotal;
    so.vatTotal = vatTotal;
    so.sdTotal = sdTotal;
    so.taxTotal = taxTotal;
    so.totalAmount = totalAmount;
    so.financeInvoiceId = invoice.id;
    so.mushak63Id = mushak.id;

    await this.soRepo.save(so);

    return {
      salesOrderId: so.id,
      financeInvoiceId: invoice.id,
      mushak63Id: mushak.id,
      invoiceNumber,
      salesOrder: await this.getSalesOrder(tenantId, salesOrderId),
      invoice,
      mushak63: mushak,
    };
  }

  async createDeliveryOrder(
    tenantId: string,
    dto: CreateDeliveryOrderDto,
  ): Promise<DeliveryOrder> {
    const so = await this.getSalesOrder(tenantId, dto.salesOrderId);
    if (
      so.status !== SOStatus.CONFIRMED &&
      so.status !== SOStatus.PARTIALLY_DELIVERED
    ) {
      throw new BadRequestException(
        'Sales order must be CONFIRMED or PARTIALLY_DELIVERED to create a delivery order',
      );
    }

    const lines = dto.lines.map((line) =>
      this.doRepo.manager.create(DeliveryOrderLine, {
        tenantId,
        soLineId: line.soLineId,
        productId: line.productId,
        quantity: line.quantity,
      }),
    );

    const doRecord = this.doRepo.create({
      tenantId,
      salesOrderId: dto.salesOrderId,
      doNumber: dto.doNumber ?? `DO-${Date.now()}`,
      status: DOStatus.DRAFT,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
      lines,
    });

    return this.doRepo.save(doRecord);
  }

  async shipDeliveryOrder(
    tenantId: string,
    doId: string,
    warehouseId: string,
  ): Promise<DeliveryOrder> {
    const deliveryOrder = await this.doRepo.findOne({
      where: { id: doId, tenantId },
      relations: ['lines', 'salesOrder', 'salesOrder.lines'],
    });

    if (!deliveryOrder) throw new NotFoundException('Delivery order not found');
    if (deliveryOrder.status !== DOStatus.DRAFT) {
      throw new BadRequestException(
        'Only DRAFT delivery orders can be shipped',
      );
    }

    // 1. Issue stock for each line
    for (const line of deliveryOrder.lines) {
      await this.inventoryService.issueStock({
        productId: line.productId,
        warehouseId,
        quantity: Number(line.quantity),
        reference: deliveryOrder.doNumber,
      });

      // 2. Update Sales Order Line delivered quantity
      const soLine = deliveryOrder.salesOrder.lines.find(
        (l) => l.id === line.soLineId,
      );
      if (soLine) {
        soLine.deliveredQuantity =
          Number(soLine.deliveredQuantity) + Number(line.quantity);
        await this.soRepo.manager.save(SalesOrderLine, soLine);
      }
    }

    // 3. Update Delivery Order status
    deliveryOrder.status = DOStatus.SHIPPED;
    await this.doRepo.save(deliveryOrder);

    // 4. Update Sales Order status
    const so = deliveryOrder.salesOrder;
    const allDelivered = so.lines.every(
      (l) => Number(l.deliveredQuantity) >= Number(l.quantity),
    );
    so.status = allDelivered
      ? SOStatus.DELIVERED
      : SOStatus.PARTIALLY_DELIVERED;
    await this.soRepo.save(so);

    return deliveryOrder;
  }
}
