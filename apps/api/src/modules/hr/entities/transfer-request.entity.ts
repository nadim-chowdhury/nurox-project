import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from './employee.entity';
import { Department } from './department.entity';
import { Branch } from '../../system/entities/branch.entity';

export enum TransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

@Entity('transfer_requests')
export class TransferRequest extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'uuid' })
  oldDepartmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'oldDepartmentId' })
  oldDepartment: Department;

  @Column({ type: 'uuid' })
  newDepartmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'newDepartmentId' })
  newDepartment: Department;

  @Column({ type: 'uuid' })
  oldBranchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'oldBranchId' })
  oldBranch: Branch;

  @Column({ type: 'uuid' })
  newBranchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'newBranchId' })
  newBranch: Branch;

  @Column({ type: 'date' })
  effectiveDate: string;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'uuid', nullable: true })
  requestedById: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date;
}
