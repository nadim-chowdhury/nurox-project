import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PayrollRunStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('payroll_runs')
export class PayrollRun extends BaseEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  runId: string; // e.g. PR-2026-04

  @Column({ type: 'varchar', length: 20 })
  period: string; // e.g. April 2026

  @Column({ type: 'date' })
  payDate: string;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalGross: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalNet: number;

  @Column({
    type: 'enum',
    enum: PayrollRunStatus,
    default: PayrollRunStatus.DRAFT,
  })
  status: PayrollRunStatus;
}

@Entity('payslips')
export class Payslip extends BaseEntity {
  @Column({ type: 'uuid' })
  payrollRunId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'varchar', length: 150 })
  employeeName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  allowances: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grossPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  netPay: number;
}
