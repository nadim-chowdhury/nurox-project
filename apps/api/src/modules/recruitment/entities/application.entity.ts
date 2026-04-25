import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { JobRequisition } from './job-requisition.entity';
import { Candidate } from './candidate.entity';
import { Interview } from './interview.entity';
import { OfferLetter } from './offer-letter.entity';

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SCREENED = 'SCREENED',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

@Entity('applications')
export class Application extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  jobId: string;

  @ManyToOne(() => JobRequisition, (job) => job.applications)
  @JoinColumn({ name: 'jobId' })
  job: JobRequisition;

  @Column({ type: 'uuid' })
  candidateId: string;

  @ManyToOne(() => Candidate, (candidate) => candidate.applications)
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status: ApplicationStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  appliedDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => Interview, (interview) => interview.application)
  interviews: Interview[];

  @OneToMany(() => OfferLetter, (offer) => offer.application)
  offerLetters: OfferLetter[];
}
