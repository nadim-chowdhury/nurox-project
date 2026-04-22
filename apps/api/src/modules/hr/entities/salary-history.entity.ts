import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from './employee.entity';

export enum SalaryChangeReason {
  ANNUAL_REVISION = 'ANNUAL_REVISION',
  PROMOTION = 'PROMOTION',
  PERFORMANCE_BONUS = 'PERFORMANCE_BONUS',
  INITIAL_OFFER = 'INITIAL_OFFER',
  CORRECTION = 'CORRECTION',
}

@Entity('salary_history')
export class SalaryHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  previousSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  newSalary: number;

  @Column({ type: 'date' })
  effectiveDate: string;

  @Column({
    type: 'enum',
    enum: SalaryChangeReason,
    default: SalaryChangeReason.ANNUAL_REVISION,
  })
  reason: SalaryChangeReason;

  @Column({ type: 'varchar', length: 500, nullable: true })
  comments: string | null;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string | null;

  @Column({ type: 'boolean', default: false })
  isProcessedInPayroll: boolean;
}
