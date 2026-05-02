import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ShiftType {
  MORNING = 'MORNING',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  ROTATING = 'ROTATING',
}

@Entity('shifts')
export class Shift extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'time' })
  startTime: string; // Format "HH:mm"

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: ShiftType,
    default: ShiftType.MORNING,
  })
  type: ShiftType;

  @Column({ type: 'int', default: 15 })
  gracePeriodMinutes: number;

  @Column({ type: 'time', nullable: true })
  halfDayCutoffTime: string; // e.g. "12:00"

  @Column({ type: 'int', default: 0 })
  earlyDepartureAllowance: number;

  @Column({ type: 'int', default: 60 })
  breakTimeMinutes: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
