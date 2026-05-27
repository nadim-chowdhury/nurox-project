import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../system/entities/tenant.entity';
import { WorkOrder } from './work-order.entity';

@Entity('production_logs')
export class ProductionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
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

  @CreateDateColumn()
  createdAt: Date;
}
