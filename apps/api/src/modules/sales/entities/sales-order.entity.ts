import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Account } from './account.entity';
import { Quotation } from './quotation.entity';

export enum SOStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  DELIVERED = 'DELIVERED',
  INVOICED = 'INVOICED',
  CANCELLED = 'CANCELLED',
}

@Entity('sales_orders')
export class SalesOrder extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  soNumber: string;

  @Column({ type: 'uuid', nullable: true })
  quotationId: string | null;

  @ManyToOne(() => Quotation, { nullable: true })
  @JoinColumn({ name: 'quotationId' })
  quotation: Quotation | null;

  @Column({ type: 'uuid' })
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'enum', enum: SOStatus, default: SOStatus.DRAFT })
  status: SOStatus;

  @Column({ type: 'timestamptz' })
  orderDate: Date;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @OneToMany(() => SalesOrderLine, (line) => line.salesOrder, { cascade: true })
  lines: SalesOrderLine[];
}

@Entity('sales_order_lines')
export class SalesOrderLine extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  salesOrderId: string;

  @ManyToOne(() => SalesOrder, (so) => so.lines)
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder: SalesOrder;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  variantId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deliveredQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  invoicedQuantity: number;
}
