import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity({ name: 'invoices', schema: 'public' })
export class Invoice extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountDue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountRemaining: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string; // draft, open, paid, uncollectible, void

  @Column({ type: 'varchar', length: 1024, nullable: true })
  hostedInvoiceUrl: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  pdfUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeInvoiceId: string;

  @Column({ type: 'varchar', length: 50, default: 'stripe' })
  paymentProvider: string; // stripe, sslcommerz

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;
}
