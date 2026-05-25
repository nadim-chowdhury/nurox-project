import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum TimesheetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('timesheets')
export class Timesheet extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  userId: string; // The employee

  @Column({ type: 'uuid', nullable: true })
  managerId: string | null; // The approver

  @Column({ type: 'timestamptz' })
  periodStartDate: Date;

  @Column({ type: 'timestamptz' })
  periodEndDate: Date;

  @Column({ type: 'enum', enum: TimesheetStatus, default: TimesheetStatus.DRAFT })
  status: TimesheetStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalHours: number;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;
}
