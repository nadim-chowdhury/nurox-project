import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Vendor } from './vendor.entity';

export enum RfqStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

@Entity('rfqs')
export class Rfq extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  rfqNumber: string;

  @Column({ type: 'enum', enum: RfqStatus, default: RfqStatus.DRAFT })
  status: RfqStatus;

  @Column({ type: 'timestamptz' })
  deadline: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToMany(() => Vendor)
  @JoinTable({ name: 'rfq_vendors' })
  vendors: Vendor[];

  @OneToMany(() => VendorQuote, (quote) => quote.rfq)
  quotes: VendorQuote[];
}

@Entity('vendor_quotes')
export class VendorQuote extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  rfqId: string;

  @ManyToMany(() => Rfq, (rfq) => rfq.quotes)
  rfq: Rfq;

  @Column({ type: 'uuid' })
  vendorId: string;

  @Column({ type: 'varchar', length: 50 })
  quoteNumber: string;

  @Column({ type: 'timestamptz' })
  quoteDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  validUntil: Date | null;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'jsonb' })
  lines: any[]; // Stores quoted items
}
