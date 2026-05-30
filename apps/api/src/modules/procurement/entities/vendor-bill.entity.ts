import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Vendor } from './vendor.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { Grn } from './grn.entity';
import { VendorBillLine } from './vendor-bill-line.entity';

export enum VendorBillStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('vendor_bills')
@Index(['tenantId', 'billNumber'], { unique: true })
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

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  vatTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  sdTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: VendorBillStatus,
    default: VendorBillStatus.DRAFT,
  })
  status: VendorBillStatus;

  @Column({ type: 'uuid', nullable: true })
  financeBillId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => VendorBillLine, (line) => line.vendorBill, {
    cascade: true,
  })
  lines: VendorBillLine[];
}
