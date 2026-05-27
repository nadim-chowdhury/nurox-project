import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity('workflow_rules')
export class WorkflowRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  name: string;

  @Column()
  triggerEvent: string; // e.g. 'LEAVE_APPROVED'

  @Column({ type: 'jsonb', nullable: true })
  conditionLogic: any; // e.g. { field: 'department', operator: 'eq', value: 'Engineering' }

  @Column()
  actionType: string; // e.g. 'SEND_SLACK_WEBHOOK'

  @Column({ type: 'jsonb' })
  actionPayload: any;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
