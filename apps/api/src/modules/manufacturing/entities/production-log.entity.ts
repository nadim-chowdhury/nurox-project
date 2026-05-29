import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';
import { WorkOrder } from './work-order.entity';

@Entity('production_logs')
export class ProductionLog extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  workOrderId: string;

  @ManyToOne(() => WorkOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @Column({ type: 'uuid' })
  loggedById: string; // Employee ID

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  completedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  scrapQuantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  scrapReason: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  laborHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  machineHours: number;
}
