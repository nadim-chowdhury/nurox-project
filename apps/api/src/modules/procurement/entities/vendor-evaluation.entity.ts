import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Vendor } from './vendor.entity';

@Entity('vendor_evaluations')
export class VendorEvaluation extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'uuid' })
  evaluatorId: string;

  @Column({ type: 'timestamptz' })
  evaluationDate: Date;

  @Column({ type: 'int' })
  deliveryScore: number;

  @Column({ type: 'int' })
  qualityScore: number;

  @Column({ type: 'int' })
  pricingScore: number;

  @Column({ type: 'int' })
  responsivenessScore: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
