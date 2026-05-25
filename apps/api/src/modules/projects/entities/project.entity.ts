import { Entity, Column, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Task } from './task.entity';
import { Milestone } from './milestone.entity';

export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('projects')
export class Project extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  client: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  type: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  status: ProjectStatus;

  @Column({ type: 'date', nullable: true })
  startDate: string | null;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100 derived value

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  budgetCost: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  budgetTime: number | null;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'uuid', nullable: true })
  managerId: string | null;

  @OneToMany(() => Task, (t) => t.project, { cascade: true })
  tasks: Task[];

  @OneToMany(() => Milestone, (m) => m.project, { cascade: true })
  milestones: Milestone[];
}
