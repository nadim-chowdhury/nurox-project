import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Account } from './account.entity';
import { Contact } from './contact.entity';
import { Deal } from './deal.entity';

export enum QuotationStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('quotations')
export class Quotation extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  quotationNumber: string;

  @Column({ type: 'uuid', nullable: true })
  accountId: string | null;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'accountId' })
  account: Account | null;

  @Column({ type: 'uuid', nullable: true })
  contactId: string | null;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contactId' })
  contact: Contact | null;

  @Column({ type: 'uuid', nullable: true })
  dealId: string | null;

  @ManyToOne(() => Deal, { nullable: true })
  @JoinColumn({ name: 'dealId' })
  deal: Deal | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.DRAFT,
  })
  status: QuotationStatus;

  @Column({ type: 'timestamptz' })
  issueDate: Date;

  @Column({ type: 'timestamptz' })
  validUntil: Date;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @OneToMany(() => QuotationLine, (line) => line.quotation, { cascade: true })
  lines: QuotationLine[];
}

@Entity('quotation_lines')
export class QuotationLine extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  quotationId: string;

  @ManyToOne(() => Quotation, (q) => q.lines)
  @JoinColumn({ name: 'quotationId' })
  quotation: Quotation;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  variantId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercent: number;
}
