import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from './employee.entity';

@Entity('clearance_checklists')
export class ClearanceChecklist extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'varchar', length: 255 })
  itemName: string; // e.g. Laptop, ID Card, Access Badge

  @Column({ type: 'boolean', default: false })
  isCleared: boolean;

  @Column({ type: 'date', nullable: true })
  clearedAt: string;

  @Column({ type: 'uuid', nullable: true })
  clearedById: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}
