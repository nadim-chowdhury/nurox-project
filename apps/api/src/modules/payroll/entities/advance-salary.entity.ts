import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from '../../hr/entities/employee.entity';

export enum AdvanceSalaryStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  DEDUCTED = 'DEDUCTED',
  CANCELLED = 'CANCELLED',
}

@Entity('advance_salary_requests')
export class AdvanceSalaryRequest extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  requestedDate: string;

  @Column({ type: 'varchar', length: 20 })
  deductionPeriod: string; // e.g., "2026-05"

  @Column({
    type: 'enum',
    enum: AdvanceSalaryStatus,
    default: AdvanceSalaryStatus.PENDING,
  })
  status: AdvanceSalaryStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamp', nullable: true })
  disbursedAt: Date;
}
