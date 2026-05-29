import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from './tenant.entity';

@Entity({ name: 'tenant_modules', schema: 'public' })
export class TenantModule extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'varchar', length: 100 })
  moduleKey: string; // 'hr', 'sales', 'projects', 'finance'

  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;
}
