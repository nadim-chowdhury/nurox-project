import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { KeyResult } from './performance.entity';

@Entity('okr_checkins')
export class OKRCheckIn extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  keyResultId: string;

  @ManyToOne(() => KeyResult, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'keyResultId' })
  keyResult: KeyResult;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  value: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'date' })
  checkInDate: string;

  @Column({ type: 'uuid' })
  checkedById: string;
}
