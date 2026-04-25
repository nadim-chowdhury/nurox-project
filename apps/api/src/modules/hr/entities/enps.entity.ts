import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Department } from './department.entity';

@Entity('enps_surveys')
export class ENPSSurvey extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ENPSResponse, (r) => r.survey)
  responses: ENPSResponse[];
}

@Entity('enps_responses')
export class ENPSResponse extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  surveyId: string;

  @ManyToOne(() => ENPSSurvey, (s) => s.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey: ENPSSurvey;

  @Column({ type: 'int' })
  score: number; // 0-10

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'uuid', nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
