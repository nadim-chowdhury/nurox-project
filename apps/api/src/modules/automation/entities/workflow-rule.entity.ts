import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity('workflow_rules')
export class WorkflowRule extends TenantBaseEntity {
  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  triggerEvent: string; // e.g. 'employee.created'

  @Column({ type: 'jsonb', nullable: true })
  conditionLogic: any; // e.g. { field: 'department', operator: 'eq', value: 'Engineering' }

  @Column({ type: 'varchar' })
  actionType: string; // e.g. 'SEND_SLACK_WEBHOOK'

  @Column({ type: 'jsonb' })
  actionPayload: any;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
