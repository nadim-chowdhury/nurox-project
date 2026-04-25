import { Entity, Column, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from './employee.entity';

/**
 * Grade entity — salary bands and seniority levels.
 */
@Entity('grades')
export class Grade extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // e.g. G1, G2, Senior, Executive

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  maxSalary: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Employee, (e) => e.grade)
  employees: Employee[];
}
