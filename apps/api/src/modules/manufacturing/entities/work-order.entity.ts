import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Tenant } from '../../system/entities/tenant.entity';
import { Bom } from './bom.entity';
import { Workcenter } from './workcenter.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
