import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Vendor } from './vendor.entity';
import { Product } from '../../inventory/entities/product.entity';
import { ProductVariant } from '../../inventory/entities/product-variant.entity';

export enum PoStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  FULLY_RECEIVED = 'FULLY_RECEIVED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

@Entity('purchase_orders')
export class PurchaseOrder extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  poNumber: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'enum', enum: PoStatus, default: PoStatus.DRAFT })
  status: PoStatus;

  @Column({ type: 'timestamptz' })
  orderDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expectedDeliveryDate: Date | null;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grandTotal: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  paymentTerms: string | null;

  @Column({ type: 'text', nullable: true })
  shippingAddress: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @OneToMany(() => PurchaseOrderLine, (line) => line.purchaseOrder, {
    cascade: true,
  })
  lines: PurchaseOrderLine[];

  @Column({ type: 'jsonb', nullable: true })
  history: any[]; // For version history/amendments
}

@Entity('purchase_order_lines')
export class PurchaseOrderLine extends BaseEntity {
  @Column({ type: 'uuid' })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.lines)
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  receivedQuantity: number;
}
