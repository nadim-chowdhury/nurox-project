import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from './employee.entity';
import { Designation } from './designation.entity';
import { Grade } from './grade.entity';

export enum RevisionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  APPLIED = 'APPLIED',
}

@Entity('salary_revisions')
export class SalaryRevision extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  currentSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  proposedSalary: number;

  @Column({ type: 'uuid', nullable: true })
  currentDesignationId: string | null;

  @ManyToOne(() => Designation)
  @JoinColumn({ name: 'currentDesignationId' })
  currentDesignation: Designation;

  @Column({ type: 'uuid', nullable: true })
  proposedDesignationId: string | null;

  @ManyToOne(() => Designation)
  @JoinColumn({ name: 'proposedDesignationId' })
  proposedDesignation: Designation;

  @Column({ type: 'uuid', nullable: true })
  currentGradeId: string | null;

  @ManyToOne(() => Grade)
  @JoinColumn({ name: 'currentGradeId' })
  currentGrade: Grade;

  @Column({ type: 'uuid', nullable: true })
  proposedGradeId: string | null;

  @ManyToOne(() => Grade)
  @JoinColumn({ name: 'proposedGradeId' })
  proposedGrade: Grade;

  @Column({ type: 'date' })
  effectiveDate: string;

  @Column({
    type: 'enum',
    enum: RevisionStatus,
    default: RevisionStatus.DRAFT,
  })
  status: RevisionStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'uuid', nullable: true })
  requestedById: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date;
}
