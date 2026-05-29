import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Vendor } from './vendor.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { Grn } from './grn.entity';

export enum VendorBillStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('vendor_bills')
export class VendorBill extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'uuid' })
  poId: string;

  @ManyToOne(() => PurchaseOrder)
  @JoinColumn({ name: 'poId' })
  purchaseOrder: PurchaseOrder;

  @Column({ type: 'uuid', nullable: true })
  grnId: string | null;

  @ManyToOne(() => Grn)
  @JoinColumn({ name: 'grnId' })
  grn: Grn | null;

  @Column({ type: 'varchar', length: 100 })
  billNumber: string;

  @Column({ type: 'timestamptz' })
  billDate: Date;

  @Column({ type: 'timestamptz' })
  dueDate: Date;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: VendorBillStatus,
    default: VendorBillStatus.DRAFT,
  })
  status: VendorBillStatus;
}
