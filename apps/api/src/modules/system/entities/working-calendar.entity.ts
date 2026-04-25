import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Branch } from './branch.entity';

@Entity('working_calendars')
export class WorkingCalendar extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ type: 'simple-array' })
  workingDays: string[]; // ['monday', 'tuesday', ...]

  @Column({ type: 'simple-array', nullable: true })
  halfDays: string[];

  @Column({ type: 'jsonb', nullable: true })
  shiftOverrides: Record<string, string>; // e.g. { 'friday': '09:00-13:00' }

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;
}
