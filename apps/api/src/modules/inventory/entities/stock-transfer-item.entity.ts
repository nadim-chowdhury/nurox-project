import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StockTransfer } from './stock-transfer.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Batch } from './batch.entity';

@Entity('stock_transfer_items')
export class StockTransferItem extends BaseEntity {
  @Column({ type: 'uuid' })
  stockTransferId: string;

  @ManyToOne(() => StockTransfer, (transfer) => transfer.items)
  @JoinColumn({ name: 'stockTransferId' })
  stockTransfer: StockTransfer;

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
  batchId: string;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batchId' })
  batch: Batch;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;
}
