import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Designation } from './designation.entity';
import { Employee } from './employee.entity';

export enum ReadinessLevel {
  READY_NOW = 'READY_NOW',
  READY_IN_1_YEAR = 'READY_IN_1_YEAR',
  READY_IN_2_YEARS = 'READY_IN_2_YEARS',
  READY_WITH_DEVELOPMENT = 'READY_IN_WITH_DEVELOPMENT',
}

@Entity('succession_plans')
export class SuccessionPlan extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  designationId: string;

  @ManyToOne(() => Designation)
  @JoinColumn({ name: 'designationId' })
  designation: Designation;

  @Column({ type: 'uuid' })
  successorId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'successorId' })
  successor: Employee;

  @Column({
    type: 'enum',
    enum: ReadinessLevel,
    default: ReadinessLevel.READY_IN_1_YEAR,
  })
  readiness: ReadinessLevel;

  @Column({ type: 'text', nullable: true })
  developmentPlan: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
