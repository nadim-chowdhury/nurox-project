import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum BillStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
}

@Entity('bills')
export class Bill extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  billNumber: string;

  @Column({ type: 'varchar', length: 150 })
  vendorName: string;

  @Column({ type: 'uuid', nullable: true })
  vendorId: string | null;

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

  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.DRAFT })
  status: BillStatus;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => BillLine, (line) => line.bill, { cascade: true })
  lines: BillLine[];
}

@Entity('bill_lines')
export class BillLine extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  billId: string;

  @ManyToOne(() => Bill, (bill) => bill.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'billId' })
  bill: Bill;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineTotal: number;

  @Column({ type: 'uuid', nullable: true })
  accountId: string | null;
}

