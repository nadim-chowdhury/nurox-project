import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Warehouse } from './warehouse.entity';
import { GoodsReceiptItem } from './goods-receipt-item.entity';

export enum GoodsReceiptStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('goods_receipts')
export class GoodsReceipt extends BaseEntity {
  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string | null;

  @Column({ type: 'enum', enum: GoodsReceiptStatus, default: GoodsReceiptStatus.DRAFT })
  status: GoodsReceiptStatus;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => GoodsReceiptItem, (item) => item.goodsReceipt)
  items: GoodsReceiptItem[];
}
