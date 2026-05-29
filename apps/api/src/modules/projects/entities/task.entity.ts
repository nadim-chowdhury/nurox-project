import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Project } from './project.entity';

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

@Entity('tasks')
@Tree('closure-table')
export class Task extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, (p) => p.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @TreeParent()
  parent: Task;

  @TreeChildren()
  children: Task[];

  @Column({ type: 'jsonb', nullable: true })
  assignees: string[] | null; // Array of user UUIDs

  @Column({ type: 'boolean', default: true })
  isBillable: boolean;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.NOT_STARTED })
  status: TaskStatus;

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @Column({ type: 'int', nullable: true })
  estimatedHours: number | null;

  @Column({ type: 'int', default: 0 })
  loggedHours: number;
}
