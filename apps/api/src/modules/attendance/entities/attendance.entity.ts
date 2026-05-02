import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from '../../hr/entities/employee.entity';

export enum AttendanceMethod {
  MANUAL = 'MANUAL',
  QR = 'QR',
  BIOMETRIC = 'BIOMETRIC',
  GEO_FENCED = 'GEO_FENCED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EARLY_EXIT = 'EARLY_EXIT',
  ON_LEAVE = 'ON_LEAVE',
  HALF_DAY = 'HALF_DAY',
}

@Entity('attendance_records')
export class AttendanceRecord extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'timestamptz', nullable: true })
  checkIn: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  checkOut: Date | null;

  @Column({
    type: 'enum',
    enum: AttendanceMethod,
    default: AttendanceMethod.MANUAL,
  })
  method: AttendanceMethod;

  @Column({ type: 'jsonb', nullable: true })
  location: { lat: number; lng: number; address?: string } | null;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'boolean', default: false })
  isOvertime: boolean;

  @Column({ type: 'int', default: 0 })
  overtimeMinutes: number;

  @Column({ type: 'boolean', default: false })
  isOvertimeApproved: boolean;

  @Column({ type: 'uuid', nullable: true })
  overtimeApprovedById: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remarks: string | null;
}
