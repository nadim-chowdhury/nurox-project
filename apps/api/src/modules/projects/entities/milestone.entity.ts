import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Project } from './project.entity';

@Entity('milestones')
export class Milestone extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.milestones)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'timestamptz' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'uuid', nullable: true })
  predecessorId: string | null;

  @ManyToOne(() => Milestone, { nullable: true })
  @JoinColumn({ name: 'predecessorId' })
  predecessor: Milestone | null;
}
