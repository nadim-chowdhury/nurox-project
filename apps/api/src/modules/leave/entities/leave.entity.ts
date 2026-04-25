import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from '../../hr/entities/employee.entity';

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  CASUAL = 'CASUAL',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  COMPENSATORY = 'COMPENSATORY',
}

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED_BY_MANAGER = 'APPROVED_BY_MANAGER',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('leave_requests')
export class LeaveRequest extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: LeaveType })
  leaveType: LeaveType;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  totalDays: number;

  @Column({ type: 'varchar', length: 500 })
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveRequestStatus,
    default: LeaveRequestStatus.PENDING,
  })
  status: LeaveRequestStatus;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comments: string | null;
}

@Entity('leave_balances')
export class LeaveBalance extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: LeaveType })
  leaveType: LeaveType;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 0 })
  totalDays: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 0 })
  usedDays: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 0 })
  carriedForwardDays: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: string | null;

  @Column({ type: 'varchar', length: 10 })
  fiscalYear: string; // e.g., "2025-26"
}
