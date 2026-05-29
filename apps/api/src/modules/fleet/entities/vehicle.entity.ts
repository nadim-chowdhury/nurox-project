import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity('vehicles')
export class Vehicle extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'varchar', length: 50 })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 50 })
  make: string;

  @Column({ type: 'varchar', length: 50 })
  model: string;

  @Column({ type: 'enum', enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'] })
  fuelType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  capacityKg: number;

  @Column({ type: 'timestamp', nullable: true })
  insuranceExpiry: Date;

  @Column({ type: 'timestamp', nullable: true })
  roadTaxExpiry: Date;
}
