import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum DealStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
}

export enum DealStage {
  PROSPECTING = 'PROSPECTING',
  QUALIFICATION = 'QUALIFICATION',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

@Entity('deals')
export class Deal extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  customerName: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'enum', enum: DealStage, default: DealStage.PROSPECTING })
  stage: DealStage;

  @Column({ type: 'enum', enum: DealStatus, default: DealStatus.OPEN })
  status: DealStatus;

  @Column({ type: 'int', default: 0 })
  probability: number; // 0-100

  @Column({ type: 'date', nullable: true })
  expectedCloseDate: string | null;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
