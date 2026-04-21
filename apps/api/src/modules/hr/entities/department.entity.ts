import {
  Entity,
  Column,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from './employee.entity';

/**
 * Department entity — organizational unit grouping employees.
 */
@Entity('departments')
@Tree('closure-table')
export class Department extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string; // e.g. ENG, HR, FIN

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  headId: string | null; // employee who heads this dept

  @Column({ type: 'varchar', length: 50, nullable: true })
  costCenter: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @TreeParent()
  parent: Department;

  @TreeChildren()
  children: Department[];

  @OneToMany(() => Employee, (e) => e.department)
  employees: Employee[];
}
