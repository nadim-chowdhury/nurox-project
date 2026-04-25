import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Department } from '../../hr/entities/department.entity';
import { Designation } from '../../hr/entities/designation.entity';
import { Application } from './application.entity';

export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  OPEN = 'OPEN',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

@Entity('job_requisitions')
export class JobRequisition extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid' })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'uuid' })
  designationId: string;

  @ManyToOne(() => Designation)
  @JoinColumn({ name: 'designationId' })
  designation: Designation;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'enum', enum: EmploymentType })
  employmentType: EmploymentType;

  @Column({ type: 'int', default: 1 })
  vacancies: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minSalary: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxSalary: number | null;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  status: JobStatus;

  @Column({ type: 'jsonb', nullable: true })
  approvalChain: any[];

  @OneToMany(() => Application, (app) => app.job)
  applications: Application[];
}
