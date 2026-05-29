import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity('ticket_slas')
export class TicketSla extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'varchar' })
  priority: string; // P1, P2, P3, P4

  @Column({ type: 'int' })
  responseTimeMinutes: number;

  @Column({ type: 'int' })
  resolutionTimeMinutes: number;
}
