import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { BankAccount } from './bank-account.entity';
import { Bill } from './bill.entity';

export enum PaymentBatchStatus {
  DRAFT = 'DRAFT',
  SENT_TO_BANK = 'SENT_TO_BANK',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('payment_batches')
export class PaymentBatch extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 50 })
  batchNumber: string;

  @Column({ type: 'uuid' })
  bankAccountId: string;

  @ManyToOne(() => BankAccount)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column({ type: 'timestamptz' })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentBatchStatus,
    default: PaymentBatchStatus.DRAFT,
  })
  status: PaymentBatchStatus;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @OneToMany(() => PaymentBatchItem, (item) => item.paymentBatch, {
    cascade: true,
  })
  items: PaymentBatchItem[];

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}

@Entity('payment_batch_items')
export class PaymentBatchItem extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  paymentBatchId: string;

  @ManyToOne(() => PaymentBatch, (batch) => batch.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'paymentBatchId' })
  paymentBatch: PaymentBatch;

  @Column({ type: 'uuid' })
  billId: string;

  @ManyToOne(() => Bill)
  @JoinColumn({ name: 'billId' })
  bill: Bill;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amountToPay: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendorBankName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vendorAccountNumber: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vendorRoutingNumber: string | null;
}
