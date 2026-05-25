import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { AuditService } from '../../modules/system/audit.service';
import { BaseEntity } from '../entities/base.entity';
import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { RedisService } from '../../modules/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface<BaseEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => ClsService))
    private readonly cls: ClsService,
    @Inject(forwardRef(() => AuditService))
    private readonly auditService: AuditService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return BaseEntity;
  }

  async afterInsert(event: InsertEvent<BaseEntity>) {
    await this.logAction('INSERT', event.entity, null, event.entity);
  }

  async afterUpdate(event: UpdateEvent<BaseEntity>) {
    // If entity is not provided, we can't do much.
    // TypeORM update event usually has 'entity' (new) and 'databaseEntity' (old)
    if (event.entity && event.databaseEntity) {
      await this.logAction(
        'UPDATE',
        event.entity,
        event.databaseEntity,
        event.entity,
      );
    }
  }

  async afterRemove(event: RemoveEvent<BaseEntity>) {
    await this.logAction(
      'DELETE',
      event.databaseEntity || event.entity,
      event.databaseEntity || event.entity,
      null,
    );
  }

  private async logAction(
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    entity: any,
    oldValue: any,
    newValue: any,
  ) {
    if (!entity) return;

    const entityType = entity.constructor.name;
    // Skip logging for AuditLog itself to avoid infinite loop
    if (entityType === 'AuditLog') return;

    const userId = this.cls.get('userId');
    const tenantId = this.cls.get('tenantId') || entity.tenantId;
    const ipAddress = this.cls.get('ipAddress');
    const userAgent = this.cls.get('userAgent');
    const correlationId = this.cls.get('correlationId');
    const requestStartTime = this.cls.get('requestStartTime');

    let durationMs: number | null = null;
    if (requestStartTime) {
      durationMs = Date.now() - requestStartTime;
    }

    if (!tenantId) return; // Cannot log without tenant context

    // For updates, only log changed fields to keep it clean
    let filteredOld = oldValue;
    let filteredNew = newValue;

    if (action === 'UPDATE' && oldValue && newValue) {
      filteredOld = {};
      filteredNew = {};
      Object.keys(newValue).forEach((key) => {
        if (newValue[key] !== oldValue[key] && key !== 'updatedAt') {
          filteredOld[key] = oldValue[key];
          filteredNew[key] = newValue[key];
        }
      });
      if (Object.keys(filteredNew).length === 0) return; // No meaningful change
    }

    await this.auditService.log({
      tenantId,
      userId,
      action,
      module: this.getModuleFromEntityType(entityType),
      description: `${action} ${entityType} ${entity.id || ''}`,
      entityType,
      entityId: entity.id,
      oldValue: filteredOld,
      newValue: filteredNew,
      ipAddress,
      userAgent,
      correlationId,
      durationMs,
    });

    if (action === 'DELETE' && userId) {
      const deleteKey = `bulk:delete:${tenantId}:${userId}`;
      const deleteCount = await this.redisService.incr(deleteKey);
      if (deleteCount === 1) {
        await this.redisService.expire(deleteKey, 60);
      }
      if (deleteCount > 50) {
        Logger.warn(
          `Bulk Operation Alert: User ${userId} has deleted ${deleteCount} records in 1 minute`,
        );
        this.eventEmitter.emit('bulk.operation.alert', {
          tenantId,
          userId,
          action,
          count: deleteCount,
        });
      }
    }
  }

  private getModuleFromEntityType(entityType: string): string {
    // Basic mapping, can be expanded
    const mapping: Record<string, string> = {
      Employee: 'HR',
      Department: 'HR',
      SalaryStructure: 'PAYROLL',
      PayrollRun: 'PAYROLL',
      Invoice: 'FINANCE',
      JournalEntry: 'FINANCE',
      Product: 'INVENTORY',
      PurchaseOrder: 'PROCUREMENT',
      User: 'SYSTEM',
      Role: 'SYSTEM',
    };
    return mapping[entityType] || 'SYSTEM';
  }
}
