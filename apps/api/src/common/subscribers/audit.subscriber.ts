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
import { Injectable } from '@nestjs/common';

@EventSubscriber()
@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface<BaseEntity> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cls: ClsService,
    private readonly auditService: AuditService,
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
      await this.logAction('UPDATE', event.entity, event.databaseEntity, event.entity);
    }
  }

  async afterRemove(event: RemoveEvent<BaseEntity>) {
    await this.logAction('DELETE', event.databaseEntity || event.entity, event.databaseEntity || event.entity, null);
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
    const tenantId = this.cls.get('tenantId') || (entity as any).tenantId;
    const ipAddress = this.cls.get('ipAddress');
    const userAgent = this.cls.get('userAgent');

    if (!tenantId) return; // Cannot log without tenant context

    // For updates, only log changed fields to keep it clean
    let filteredOld = oldValue;
    let filteredNew = newValue;
    
    if (action === 'UPDATE' && oldValue && newValue) {
        filteredOld = {};
        filteredNew = {};
        Object.keys(newValue).forEach(key => {
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
    });
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
