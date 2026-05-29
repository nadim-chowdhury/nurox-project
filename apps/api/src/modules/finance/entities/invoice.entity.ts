import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PROFORMA = 'PROFORMA',
  SENT = 'SENT',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  VOID = 'VOID',
}

@Entity('invoices')
@Index(['tenantId', 'invoiceNumber'], { unique: true })
export class Invoice extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 30 })
  invoiceNumber: string;

  @Column({ type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', length: 150 })
  customerName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerEmail: string | null;

  @Column({ type: 'date' })
  issueDate: string;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ type: 'boolean', default: false })
  isProforma: boolean;

  @Column({ type: 'boolean', default: true })
  isTaxInvoice: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => InvoiceLine, (line) => line.invoice, { cascade: true })
  lines: InvoiceLine[];
}

@Entity('invoice_lines')
export class InvoiceLine extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (inv) => inv.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineTotal: number;

  @Column({ type: 'uuid', nullable: true })
  taxRateId: string | null;
}
