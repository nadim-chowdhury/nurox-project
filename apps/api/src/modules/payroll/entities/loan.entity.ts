import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from '../../hr/entities/employee.entity';

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  PAID_OFF = 'PAID_OFF',
  CANCELLED = 'CANCELLED',
}

@Entity('employee_loans')
export class EmployeeLoan extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'varchar', length: 100 })
  loanType: string; // e.g., "Personal Loan", "Emergency Loan"

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  principalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  interestRate: number; // Annual percentage

  @Column({ type: 'int' })
  tenureMonths: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlyDeduction: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRepaid: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @OneToMany(() => LoanRepayment, (r) => r.loan)
  repayments: LoanRepayment[];
}

@Entity('loan_repayments')
export class LoanRepayment extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  loanId: string;

  @ManyToOne(() => EmployeeLoan, (l) => l.repayments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan: EmployeeLoan;

  @Column({ type: 'uuid', nullable: true })
  payrollRunId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  repaymentDate: string;

  @Column({ type: 'varchar', length: 50 })
  status: string; // e.g., "PENDING", "COMPLETED"
}
