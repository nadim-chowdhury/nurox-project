import { Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Abstract tenant-scoped entity. Extends BaseEntity with a mandatory `tenantId`.
 *
 * ALL domain entities that belong to a tenant MUST extend this class
 * instead of BaseEntity. This ensures every row is tagged with a tenant
 * and that the composite index on (tenantId, createdAt) is always present.
 *
 * Global/system tables (tenants, subscription_plans, etc.) should extend
 * BaseEntity directly.
 */
@Index(['tenantId', 'createdAt'])
export abstract class TenantBaseEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string;
}
