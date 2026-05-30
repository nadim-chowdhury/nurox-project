import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';
import { WorkOrder } from './work-order.entity';
import { Workcenter } from './workcenter.entity';
import { Machine } from './machine.entity';

export enum WorkOrderStageStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED',
}

@Entity('work_order_stages')
@Index(['tenantId', 'workOrderId', 'sequence'], { unique: true })
export class WorkOrderStage extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  workOrderId: string;

  @ManyToOne(() => WorkOrder, (wo) => wo.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @Column({ type: 'int' })
  sequence: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'uuid' })
  workcenterId: string;

  @ManyToOne(() => Workcenter)
  @JoinColumn({ name: 'workcenterId' })
  workcenter: Workcenter;

  @Column({ type: 'uuid', nullable: true })
  machineId: string | null;

  @ManyToOne(() => Machine, { nullable: true })
  @JoinColumn({ name: 'machineId' })
  machine: Machine | null;

  @Column({
    type: 'enum',
    enum: WorkOrderStageStatus,
    default: WorkOrderStageStatus.PENDING,
  })
  status: WorkOrderStageStatus;

  @Column({ type: 'boolean', default: false })
  consumesBom: boolean;

  @Column({ type: 'boolean', default: false })
  materialsConsumed: boolean;

  @Column({ type: 'int', default: 0 })
  scheduledMinutes: number;

  @Column({ type: 'timestamptz', nullable: true })
  plannedStartAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  plannedEndAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  actualStartAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  actualEndAt: Date | null;
}
