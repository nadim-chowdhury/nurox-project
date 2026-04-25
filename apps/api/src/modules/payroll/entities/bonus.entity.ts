import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from '../../hr/entities/employee.entity';

export enum BonusType {
  FESTIVAL = 'FESTIVAL',
  PERFORMANCE = 'PERFORMANCE',
  COMMISSION = 'COMMISSION',
  OTHER = 'OTHER',
}

@Entity('employee_bonuses')
export class EmployeeBonus extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: BonusType,
    default: BonusType.OTHER,
  })
  type: BonusType;

  @Column({ type: 'varchar', length: 20 })
  payrollPeriod: string; // e.g., "2026-04"

  @Column({ type: 'boolean', default: false })
  isProcessed: boolean;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}
