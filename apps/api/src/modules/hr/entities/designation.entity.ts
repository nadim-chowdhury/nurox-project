import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from './employee.entity';

/**
 * Designation entity — job title / role level in the org hierarchy.
 */
@Entity('designations')
export class Designation extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  title: string;

  @Column({ type: 'int', default: 1 })
  level: number; // 1=Entry, 2=Junior, 3=Mid, 4=Senior, 5=Lead, 6=Director, 7=VP, 8=C-Level

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minSalary: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxSalary: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Employee, (e) => e.designation)
  employees: Employee[];
}
