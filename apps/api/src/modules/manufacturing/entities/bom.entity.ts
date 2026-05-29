import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';
import { BomItem } from './bom-item.entity';

@Entity('boms')
export class Bom extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  finishedProductId: string; // Refers to an inventory item

  @Column({ type: 'varchar', length: 50, default: 'v1.0' })
  version: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => BomItem, (item) => item.bom, { cascade: true })
  items: BomItem[];
}
