import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PerformanceReview } from './performance.entity';

@Entity('pip_action_plans')
export class PIPActionPlan extends BaseEntity {
  @Column({ type: 'uuid' })
  performanceReviewId: string;

  @ManyToOne(() => PerformanceReview, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'performanceReviewId' })
  performanceReview: PerformanceReview;

  @Column({ type: 'varchar', length: 500 })
  targetArea: string;

  @Column({ type: 'text' })
  expectedOutcome: string;

  @Column({ type: 'date' })
  reviewDate: string;

  @Column({ type: 'text', nullable: true })
  progressNotes: string;

  @Column({ type: 'boolean', default: false })
  isAchieved: boolean;
}
