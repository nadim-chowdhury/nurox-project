import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';
import { Vehicle } from './vehicle.entity';

@Entity('fuel_logs')
export class FuelLog extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
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
}
