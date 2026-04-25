import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum JournalStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

@Entity('journal_entries')
export class JournalEntry extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  entryNumber: string;

  @Column({ type: 'date' })
  entryDate: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string | null;

  @Column({ type: 'enum', enum: JournalStatus, default: JournalStatus.DRAFT })
  status: JournalStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDebit: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCredit: number;

  @OneToMany(() => JournalLine, (line) => line.journalEntry, { cascade: true })
  lines: JournalLine[];
}

@Entity('journal_lines')
export class JournalLine extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  journalEntryId: string;

  @ManyToOne(() => JournalEntry, (je) => je.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journalEntryId' })
  journalEntry: JournalEntry;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  accountName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  credit: number;
}
