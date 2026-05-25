import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { EmploymentType } from './job-requisition.entity';

@Entity('onboarding_templates')
export class OnboardingTemplate extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({ type: 'jsonb' })
  tasks: OnboardingTaskTemplate[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}

export interface OnboardingTaskTemplate {
  title: string;
  description: string;
  daysOffset: number; // Due date relative to start date
  ownerRole?: string; // HR, Manager, IT, or Candidate
  isRequired: boolean;
}
