import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { User } from './user.entity';

@Entity('user_dashboard_widgets')
@Index(['tenantId', 'userId', 'widgetId'], { unique: true })
export class UserDashboardWidget extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  widgetId: string; // e.g., 'kpis', 'charts', 'tasks'

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: any; // widget-specific settings like color, filters, etc.

  @Column({ type: 'int', default: 24 })
  gridSpan: number; // width in antd grid (1-24)
}
