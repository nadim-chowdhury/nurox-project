import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from './employee.entity';

export enum ResignationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  COMPLETED = 'COMPLETED',
}

@Entity('resignations')
export class Resignation extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  submissionDate: string;

  @Column({ type: 'date' })
  requestedLastWorkingDay: string;

  @Column({ type: 'date', nullable: true })
  approvedLastWorkingDay: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: ResignationStatus,
    default: ResignationStatus.PENDING,
  })
  status: ResignationStatus;

  @Column({ type: 'text', nullable: true })
  adminComments: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date;
}
