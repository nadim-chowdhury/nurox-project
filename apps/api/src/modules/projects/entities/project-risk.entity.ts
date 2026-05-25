import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Project } from './project.entity';

export enum RiskProbability {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export enum RiskImpact {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  SEVERE = 'SEVERE',
}

@Entity('project_risks')
export class ProjectRisk extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'enum', enum: RiskProbability })
  probability: RiskProbability;

  @Column({ type: 'enum', enum: RiskImpact })
  impact: RiskImpact;

  @Column({ type: 'text', nullable: true })
  mitigationPlan: string | null;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string | null; // User responsible for this risk
}
