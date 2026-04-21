import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Application } from './application.entity';

export enum OfferStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('offer_letters')
export class OfferLetter extends BaseEntity {
  @Column({ type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application, (app) => app.offerLetters)
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  baseSalary: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'date' })
  joiningDate: string;

  @Column({ type: 'date' })
  expiryDate: string;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.DRAFT,
  })
  status: OfferStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  signedUrl: string | null;
}
