import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum PettyCashType {
  OPENING_BALANCE = 'OPENING_BALANCE',
  DISBURSEMENT = 'DISBURSEMENT',
  REPLENISHMENT = 'REPLENISHMENT',
}

@Entity('petty_cash_funds')
export class PettyCashFund extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;
}

@Entity('petty_cash_transactions')
export class PettyCashTransaction extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  fundId: string;

  @Column({ type: 'date' })
  transactionDate: string;

  @Column({ type: 'enum', enum: PettyCashType })
  type: PettyCashType;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  runningBalance: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string | null;
}
