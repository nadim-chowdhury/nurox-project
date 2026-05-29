import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from './tenant.entity';

@Entity({ name: 'tenant_custom_domains', schema: 'public' })
export class TenantCustomDomain extends TenantBaseEntity {
  @ManyToOne(() => Tenant, (tenant) => tenant.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  hostname: string; // e.g., 'erp.acme.com'

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  verificationToken: string;

  @Column({ type: 'boolean', default: false })
  isSslEnabled: boolean;
}
