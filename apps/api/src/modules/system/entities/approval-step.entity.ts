import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { ApprovalWorkflow } from './approval-workflow.entity';

export enum ApproverType {
  ROLE = 'ROLE',
  SPECIFIC_USER = 'SPECIFIC_USER',
  MANAGER_OF_CREATOR = 'MANAGER_OF_CREATOR',
}

@Entity('approval_steps')
export class ApprovalStep extends TenantBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  workflowId: string;

  @ManyToOne(() => ApprovalWorkflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: ApprovalWorkflow;

  @Column({ type: 'int' })
  stepOrder: number;

  @Column({ type: 'enum', enum: ApproverType })
  approverType: ApproverType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  approverValue: string; // role name or user ID

  @Column({ type: 'float', nullable: true })
  amountThreshold: number; // Step applies only if amount > threshold
}
