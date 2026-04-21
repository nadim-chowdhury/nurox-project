import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Department } from './department.entity';
import { Designation } from './designation.entity';
import { PerformanceReview } from './performance.entity';
import { SalaryHistory } from './salary-history.entity';
import { Training } from './training.entity';
import { Skill } from './skill.entity';
import { EmploymentHistory } from './employment-history.entity';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  PROBATION = 'PROBATION',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

/**
 * Employee entity — represents a person employed by the organization.
 * Linked to User for auth, Department for org structure, Designation for job title.
 */
@Entity('employees')
export class Employee extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  employeeId: string; // e.g. EMP-001

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ type: 'date' })
  joinDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salary: number;

  @Column({ type: 'date', nullable: true })
  probationEndDate: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  // Emergency contact
  @Column({ type: 'varchar', length: 100, nullable: true })
  emergencyContactName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergencyContactPhone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emergencyContactRelation: string | null;

  // Relations
  @Column({ type: 'uuid', nullable: true })
  departmentId: string | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'uuid', nullable: true })
  designationId: string | null;

  @ManyToOne(() => Designation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'designationId' })
  designation: Designation;

  @Column({ type: 'uuid', nullable: true })
  managerId: string | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'managerId' })
  manager: Employee;

  @OneToMany(() => PerformanceReview, (pr) => pr.employee)
  performanceReviews: PerformanceReview[];

  @OneToMany(() => SalaryHistory, (sh) => sh.employee)
  salaryHistory: SalaryHistory[];

  @OneToMany(() => Training, (t) => t.employee)
  trainings: Training[];

  @OneToMany(() => Skill, (s) => s.employee)
  skills: Skill[];

  @OneToMany(() => EmploymentHistory, (eh) => eh.employee)
  employmentHistory: EmploymentHistory[];

  // Optional link to auth user
  @Column({ type: 'uuid', nullable: true, unique: true })
  userId: string | null;
}
