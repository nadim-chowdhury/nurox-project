import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum TransactionStatus {
  UNRECONCILED = 'UNRECONCILED',
  RECONCILED = 'RECONCILED',
  VOID = 'VOID',
}

@Entity('bank_transactions')
export class BankTransaction extends BaseEntity {
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string | null;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.UNRECONCILED,
  })
  status: TransactionStatus;

  @Column({ type: 'uuid', nullable: true })
  matchedJournalEntryId: string | null;

  @Column({ type: 'uuid' })
  bankAccountId: string;
}
