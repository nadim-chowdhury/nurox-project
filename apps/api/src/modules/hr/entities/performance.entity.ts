import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from './employee.entity';

export enum PerformanceReviewStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Entity('performance_reviews')
export class PerformanceReview extends BaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'varchar', length: 500 })
  objective: string;

  @Column({ type: 'varchar', length: 20 })
  period: string; // e.g., "Q1 2026"

  @Column({
    type: 'enum',
    enum: PerformanceReviewStatus,
    default: PerformanceReviewStatus.ACTIVE,
  })
  status: PerformanceReviewStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number; // 0.00 - 100.00

  @OneToMany(() => KeyResult, (kr) => kr.performanceReview, { cascade: true })
  keyResults: KeyResult[];
}

@Entity('key_results')
export class KeyResult extends BaseEntity {
  @Column({ type: 'uuid' })
  performanceReviewId: string;

  @ManyToOne(() => PerformanceReview, (pr) => pr.keyResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'performanceReviewId' })
  performanceReview: PerformanceReview;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  targetValue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  weight: number; // 0.00 - 100.00
}
