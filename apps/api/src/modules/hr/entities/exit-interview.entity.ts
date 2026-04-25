import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Employee } from './employee.entity';

@Entity('exit_interviews')
export class ExitInterview extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @OneToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  interviewDate: string;

  @Column({ type: 'jsonb' })
  responses: {
    reasonForLeaving: string;
    satisfactionWithRole: number;
    satisfactionWithManagement: number;
    recommendCompany: boolean;
    additionalComments: string;
  };

  @Column({ type: 'uuid', nullable: true })
  interviewerId: string;
}
