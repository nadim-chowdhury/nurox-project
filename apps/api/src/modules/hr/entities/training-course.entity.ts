import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('training_courses')
export class TrainingCourse extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  category: string; // e.g. Compliance, Technical, Soft Skills

  @Column({ type: 'varchar', length: 255, nullable: true })
  provider: string;

  @Column({ type: 'int', nullable: true })
  durationHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  link: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
