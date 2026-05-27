import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
