import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from './employee.entity';

export enum ProbationStatus {
  PENDING = 'PENDING',
  EXTENDED = 'EXTENDED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('probation_records')
export class ProbationRecord extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  originalEndDate: string;

  @Column({ type: 'date' })
  currentEndDate: string;

  @Column({
    type: 'enum',
    enum: ProbationStatus,
    default: ProbationStatus.PENDING,
  })
  status: ProbationStatus;

  @Column({ type: 'int', default: 0 })
  extensionCount: number;

  @Column({ type: 'text', nullable: true })
  reviewComments: string;

  @Column({ type: 'uuid', nullable: true })
  reviewedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date;
}
