import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Warehouse } from './warehouse.entity';
import { StockCountItem } from './stock-count-item.entity';

export enum StockCountStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('stock_counts')
export class StockCount extends BaseEntity {
  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({
    type: 'enum',
    enum: StockCountStatus,
    default: StockCountStatus.DRAFT,
  })
  status: StockCountStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => StockCountItem, (item) => item.stockCount)
  items: StockCountItem[];
}
