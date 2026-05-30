import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';
import { Workcenter } from './workcenter.entity';

export enum MachineStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE',
}

@Entity('machines')
@Index(['tenantId', 'workcenterId', 'code'], { unique: true })
export class Machine extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  workcenterId: string;

  @ManyToOne(() => Workcenter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workcenterId' })
  workcenter: Workcenter;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: MachineStatus,
    default: MachineStatus.AVAILABLE,
  })
  status: MachineStatus;

  /** Units per hour capacity (for scheduling estimates). */
  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  capacityPerHour: number | null;
}
