import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../hr/entities/employee.entity';

export enum PayrollComponentType {
  EARNING = 'EARNING',
  DEDUCTION = 'DEDUCTION',
  STATUTORY = 'STATUTORY',
}

export enum AmountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

@Entity('salary_structures')
export class SalaryStructure extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @OneToMany(() => SalaryStructureComponent, (c) => c.salaryStructure, {
    cascade: true,
  })
  components: SalaryStructureComponent[];
}

@Entity('salary_structure_components')
export class SalaryStructureComponent extends BaseEntity {
  @Column({ type: 'uuid' })
  salaryStructureId: string;

  @ManyToOne(() => SalaryStructure, (s) => s.components, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'salaryStructureId' })
  salaryStructure: SalaryStructure;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., "Basic", "HRA", "Provident Fund"

  @Column({ type: 'enum', enum: PayrollComponentType })
  type: PayrollComponentType;

  @Column({ type: 'enum', enum: AmountType })
  amountType: AmountType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  value: number;

  @Column({ type: 'boolean', default: true })
  isTaxable: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dependsOn: string | null; // e.g., "Basic"
}

@Entity('employee_salary_assignments')
export class EmployeeSalaryAssignment extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'uuid' })
  salaryStructureId: string;

  @ManyToOne(() => SalaryStructure)
  @JoinColumn({ name: 'salaryStructureId' })
  salaryStructure: SalaryStructure;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
