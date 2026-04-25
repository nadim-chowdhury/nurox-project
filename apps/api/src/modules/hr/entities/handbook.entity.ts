import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('handbooks')
export class Handbook extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string; // Tiptap HTML content

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  requireAcknowledgment: boolean;

  @OneToMany(() => HandbookAcknowledgment, (a) => a.handbook)
  acknowledgments: HandbookAcknowledgment[];
}

@Entity('handbook_acknowledgments')
export class HandbookAcknowledgment extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  handbookId: string;

  @ManyToOne(() => Handbook, (h) => h.acknowledgments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'handbookId' })
  handbook: Handbook;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  acknowledgedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;
}
