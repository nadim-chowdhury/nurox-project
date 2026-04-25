import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('user_dashboard_widgets')
@Index(['userId', 'widgetId'], { unique: true })
export class UserDashboardWidget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
