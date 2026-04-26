import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from '../../hr/entities/employee.entity';

@Entity('compensatory_leaves')
export class CompensatoryLeave extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  daysGranted: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  daysUsed: number;

  @Column({ type: 'date' })
  expiryDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string; // e.g. "Worked on Sunday April 26"

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
