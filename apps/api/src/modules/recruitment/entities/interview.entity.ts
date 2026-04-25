import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Application } from './application.entity';

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

@Entity('interviews')
export class Interview extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application, (app) => app.interviews)
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @Column({ type: 'uuid', array: true })
  interviewerIds: string[];

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status: InterviewStatus;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'int', nullable: true })
  rating: number | null;
}
