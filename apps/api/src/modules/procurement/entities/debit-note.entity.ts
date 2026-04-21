import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Vendor } from './vendor.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { Grn } from './grn.entity';

@Entity('debit_notes')
export class DebitNote extends BaseEntity {
  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'uuid', nullable: true })
  grnId: string | null;

  @ManyToOne(() => Grn)
  @JoinColumn({ name: 'grnId' })
  grn: Grn | null;

  @Column({ type: 'uuid', nullable: true })
  poId: string | null;

  @ManyToOne(() => PurchaseOrder)
  @JoinColumn({ name: 'poId' })
  purchaseOrder: PurchaseOrder | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
