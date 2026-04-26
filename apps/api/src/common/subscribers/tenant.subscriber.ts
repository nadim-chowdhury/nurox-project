import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TenantBaseEntity } from '../entities/tenant-base.entity';

@EventSubscriber()
@Injectable()
export class TenantSubscriber implements EntitySubscriberInterface<TenantBaseEntity> {
  private readonly logger = new Logger(TenantSubscriber.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly cls: ClsService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return TenantBaseEntity;
  }

  /**
   * Automatically inject tenantId before insertion if it's not already set.
   */
  beforeInsert(event: InsertEvent<TenantBaseEntity>) {
    const tenantId = this.cls.get('tenantId');
    if (tenantId && !event.entity.tenantId) {
      event.entity.tenantId = tenantId;
    }
  }

  /**
   * Verify tenantId on updates to prevent accidental cross-tenant data corruption.
   */
  beforeUpdate(event: UpdateEvent<TenantBaseEntity>) {
    const tenantId = this.cls.get('tenantId');

    // If we are in a tenant context, the entity being updated MUST belong to that tenant.
    if (
      tenantId &&
      event.entity &&
      event.entity.tenantId &&
      event.entity.tenantId !== tenantId
    ) {
      this.logger.error(
        `Security Violation: Attempted to update entity belonging to tenant ${event.entity.tenantId} from context of tenant ${tenantId}`,
      );
      throw new Error(
        'Tenant isolation violation: Cannot update record from a different tenant context.',
      );
    }
  }
}
