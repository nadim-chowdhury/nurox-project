import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity('workcenters')
export class Workcenter extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  machineCostPerHour: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  laborCostPerHour: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overheadCostPerHour: number;
}
