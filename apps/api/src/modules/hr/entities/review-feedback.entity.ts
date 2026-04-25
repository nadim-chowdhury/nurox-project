import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PerformanceReview } from './performance.entity';
import { User } from '../../users/entities/user.entity';

export enum FeedbackType {
  PEER = 'PEER',
  SUBORDINATE = 'SUBORDINATE',
  MANAGER = 'MANAGER',
  SELF = 'SELF',
}

@Entity('review_feedback')
export class ReviewFeedback extends BaseEntity {
  @Column({ type: 'uuid' })
  performanceReviewId: string;

  @ManyToOne(() => PerformanceReview, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'performanceReviewId' })
  performanceReview: PerformanceReview;

  @Column({ type: 'uuid' })
  reviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({
    type: 'enum',
    enum: FeedbackType,
  })
  type: FeedbackType;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'boolean', default: false })
  isAnonymized: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
