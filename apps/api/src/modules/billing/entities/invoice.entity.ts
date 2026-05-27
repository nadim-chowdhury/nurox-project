import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity({ name: 'invoices', schema: 'public' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
