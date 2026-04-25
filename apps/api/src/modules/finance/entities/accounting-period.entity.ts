import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum PeriodStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  SOFT_LOCKED = 'SOFT_LOCKED',
}

@Entity('accounting_periods')
export class AccountingPeriod extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 50 })
  name: string; // e.g. "April 2026"

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'enum', enum: PeriodStatus, default: PeriodStatus.OPEN })
  status: PeriodStatus;

  @Column({ type: 'boolean', default: false })
  isYearEnd: boolean;
}
