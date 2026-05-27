import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../system/entities/tenant.entity';
import { Vehicle } from './vehicle.entity';

@Entity('fuel_logs')
export class FuelLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  odometer: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fuelQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @CreateDateColumn()
  createdAt: Date;
}
