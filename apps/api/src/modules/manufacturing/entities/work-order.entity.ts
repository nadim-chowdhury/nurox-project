import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';
import { Bom } from './bom.entity';
import { Workcenter } from './workcenter.entity';
import { WorkOrderStage } from './work-order-stage.entity';

@Entity('work_orders')
export class WorkOrder extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  bomId: string;

  @ManyToOne(() => Bom)
  @JoinColumn({ name: 'bomId' })
  bom: Bom;

  @Column({ type: 'uuid', nullable: true })
  workcenterId: string;

  @ManyToOne(() => Workcenter)
  @JoinColumn({ name: 'workcenterId' })
  workcenter: Workcenter;

  /** Warehouse where raw materials are issued and FG is received. */
  @Column({ type: 'uuid' })
  warehouseId: string;

  @OneToMany(() => WorkOrderStage, (stage) => stage.workOrder, {
    cascade: true,
  })
  stages: WorkOrderStage[];

  @Column({
    type: 'enum',
    enum: [
      'DRAFT',
      'RELEASED',
      'IN_PROGRESS',
      'COMPLETED',
      'CLOSED',
      'CANCELLED',
    ],
    default: 'DRAFT',
  })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  plannedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  completedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  scrapQuantity: number;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;
}
