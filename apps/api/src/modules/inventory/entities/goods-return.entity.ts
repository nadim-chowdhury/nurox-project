import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Warehouse } from './warehouse.entity';
import { GoodsReturnItem } from './goods-return-item.entity';

export enum GoodsReturnStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('goods_returns')
export class GoodsReturn extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  vendorId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string | null;

  @Column({
    type: 'enum',
    enum: GoodsReturnStatus,
    default: GoodsReturnStatus.DRAFT,
  })
  status: GoodsReturnStatus;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => GoodsReturnItem, (item) => item.goodsReturn)
  items: GoodsReturnItem[];
}
