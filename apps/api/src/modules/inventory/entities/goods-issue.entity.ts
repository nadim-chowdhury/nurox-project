import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Warehouse } from './warehouse.entity';
import { GoodsIssueItem } from './goods-issue-item.entity';

export enum GoodsIssueStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('goods_issues')
export class GoodsIssue extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string | null;

  @Column({
    type: 'enum',
    enum: GoodsIssueStatus,
    default: GoodsIssueStatus.DRAFT,
  })
  status: GoodsIssueStatus;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reasonCode: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => GoodsIssueItem, (item) => item.goodsIssue)
  items: GoodsIssueItem[];
}
