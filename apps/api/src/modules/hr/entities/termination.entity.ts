import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from './employee.entity';

export enum TerminationType {
  LAYOFF = 'LAYOFF',
  PERFORMANCE = 'PERFORMANCE',
  MISCONDUCT = 'MISCONDUCT',
  RETIREMENT = 'RETIREMENT',
  OTHER = 'OTHER',
}

@Entity('terminations')
export class Termination extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  terminationDate: string;

  @Column({ type: 'date' })
  lastWorkingDay: string;

  @Column({
    type: 'enum',
    enum: TerminationType,
  })
  type: TerminationType;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'boolean', default: false })
  isEligibleForRehire: boolean;

  @Column({ type: 'boolean', default: false })
  finalSettlementProcessed: boolean;

  @Column({ type: 'uuid', nullable: true })
  terminatedById: string;
}
