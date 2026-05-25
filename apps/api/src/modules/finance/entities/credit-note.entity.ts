import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Invoice } from './invoice.entity';

@Entity('credit_notes')
export class CreditNote extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  noteNumber: string;

  @Column({ type: 'date' })
  issueDate: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'boolean', default: false })
  isApplied: boolean;
}
