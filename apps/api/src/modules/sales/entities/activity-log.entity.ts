import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
  TASK = 'TASK',
}

export enum EntityType {
  LEAD = 'LEAD',
  CONTACT = 'CONTACT',
  DEAL = 'DEAL',
  ACCOUNT = 'ACCOUNT',
}

@Entity('activity_logs')
export class ActivityLog extends TenantBaseEntity {
  @Column({ type: 'enum', enum: EntityType })
  entityType: EntityType;

  @Column({ type: 'uuid' })
  entityId: string;

  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType;

  @Column({ type: 'varchar', length: 200 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamptz' })
  activityDate: Date;

  @Column({ type: 'uuid' })
  performedById: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
