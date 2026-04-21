import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Warehouse } from './warehouse.entity';
import { Bin } from './bin.entity';
import { Batch } from './batch.entity';

export enum StockMovementType {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

@Entity('stock_movements')
export class StockMovement extends BaseEntity {
  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant | null;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  binId: string | null;

  @ManyToOne(() => Bin)
  @JoinColumn({ name: 'binId' })
  bin: Bin | null;

  @Column({ type: 'uuid', nullable: true })
  batchId: string | null;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batchId' })
  batch: Batch | null;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reasonCode: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  unitCost: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalCost: number | null;
}
