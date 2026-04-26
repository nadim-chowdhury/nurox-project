import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from '../../hr/entities/employee.entity';
import { Shift } from '../../hr/entities/shift.entity';

@Entity('shift_assignments')
export class ShiftAssignment extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'uuid' })
  shiftId: string;

  @ManyToOne(() => Shift, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shiftId' })
  shift: Shift;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}

@Entity('shift_rotations')
export class ShiftRotation extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'simple-array' })
  shiftSequence: string[]; // Array of Shift IDs

  @Column({ type: 'int', default: 7 })
  rotationIntervalDays: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
