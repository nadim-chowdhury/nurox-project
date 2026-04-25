import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from './employee.entity';
import { SkillCatalog } from './skill-catalog.entity';

@Entity('skills')
export class Skill extends BaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'uuid', nullable: true })
  catalogId: string | null;

  @ManyToOne(() => SkillCatalog, { nullable: true })
  @JoinColumn({ name: 'catalogId' })
  catalog: SkillCatalog;

  @Column({ type: 'varchar', length: 100 })
  skillName: string;

  @Column({ type: 'int', default: 1 })
  proficiency: number; // 1-5 scale

  @Column({ type: 'date', nullable: true })
  lastAssessed: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assessedBy: string | null;
}
