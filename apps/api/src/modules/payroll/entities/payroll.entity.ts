import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../hr/entities/employee.entity';

export enum PayrollRunStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  CANCELLED = 'CANCELLED',
}

@Entity('payroll_runs')
export class PayrollRun extends BaseEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  runId: string; // e.g. PR-2026-04

  @Column({ type: 'varchar', length: 20 })
  period: string; // e.g. "2026-04"

  @Column({ type: 'date', nullable: true })
  payDate: string | null;

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

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  processedById: string | null;

  @OneToMany(() => Payslip, (p) => p.payrollRun)
  payslips: Payslip[];
}

@Entity('payslips')
export class Payslip extends BaseEntity {
  @Column({ type: 'uuid' })
  payrollRunId: string;

  @ManyToOne(() => PayrollRun, (pr) => pr.payslips, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payrollRunId' })
  payrollRun: PayrollRun;

  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grossPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  netPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  employerPfContribution: number;

  @Column({ type: 'jsonb', default: [] })
  items: Array<{
    name: string;
    amount: number;
    type: 'EARNING' | 'DEDUCTION' | 'STATUTORY';
  }>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdfUrl: string | null;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;
}
