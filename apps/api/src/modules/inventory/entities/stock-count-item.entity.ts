import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StockCount } from './stock-count.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Bin } from './bin.entity';
import { Batch } from './batch.entity';

@Entity('stock_count_items')
export class StockCountItem extends BaseEntity {
  @Column({ type: 'uuid' })
  stockCountId: string;

  @ManyToOne(() => StockCount, (sc) => sc.items)
  @JoinColumn({ name: 'stockCountId' })
  stockCount: StockCount;

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

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  expectedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  actualQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  difference: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
