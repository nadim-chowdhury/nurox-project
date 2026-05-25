import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum ExpenseClaimStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

@Entity('expense_claims')
export class ExpenseClaim extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'varchar', length: 150 })
  employeeName: string;

  @Column({ type: 'date' })
  claimDate: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receiptUrl: string | null;

  @Column({
    type: 'enum',
    enum: ExpenseClaimStatus,
    default: ExpenseClaimStatus.DRAFT,
  })
  status: ExpenseClaimStatus;

  @Column({ type: 'uuid', nullable: true })
  approverId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'boolean', default: false })
  reimburseViaPayroll: boolean;

  @Column({ type: 'uuid', nullable: true })
  paymentJournalEntryId: string | null;
}
