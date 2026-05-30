import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { VendorBill } from './vendor-bill.entity';

@Entity('vendor_bill_lines')
export class VendorBillLine extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  vendorBillId: string;

  @ManyToOne(() => VendorBill, (bill) => bill.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorBillId' })
  vendorBill: VendorBill;

  @Column({ type: 'uuid', nullable: true })
  productId: string | null;

  @Column({ type: 'uuid', nullable: true })
  poLineId: string | null;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  lineSubtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15 })
  vatRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  sdRate: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  sdAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  lineTaxTotal: number;
}
