import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from './employee.entity';
import { Department } from './department.entity';
import { Designation } from './designation.entity';

export enum EmploymentEvent {
  HIRED = 'HIRED',
  PROMOTED = 'PROMOTED',
  TRANSFERRED = 'TRANSFERRED',
  DESIGNATION_CHANGE = 'DESIGNATION_CHANGE',
  SALARY_REVISION = 'SALARY_REVISION',
  PROBATION_COMPLETED = 'PROBATION_COMPLETED',
  SUSPENDED = 'SUSPENDED',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
  EXITED = 'EXITED',
}

@Entity('employment_history')
export class EmploymentHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({
    type: 'enum',
    enum: EmploymentEvent,
  })
  event: EmploymentEvent;

  @Column({ type: 'date' })
  effectiveDate: string;

  @Column({ type: 'uuid', nullable: true })
  departmentId: string | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'uuid', nullable: true })
  designationId: string | null;

  @ManyToOne(() => Designation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'designationId' })
  designation: Designation;

  @Column({ type: 'varchar', length: 500, nullable: true })
  comments: string | null;
}
