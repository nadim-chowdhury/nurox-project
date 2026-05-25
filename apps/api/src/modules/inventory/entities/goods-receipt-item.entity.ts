import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { GoodsReceipt } from './goods-receipt.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Bin } from './bin.entity';

@Entity('goods_receipt_items')
export class GoodsReceiptItem extends BaseEntity {
  @Column({ type: 'uuid' })
  goodsReceiptId: string;

  @ManyToOne(() => GoodsReceipt, (receipt) => receipt.items)
  @JoinColumn({ name: 'goodsReceiptId' })
  goodsReceipt: GoodsReceipt;

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

  @Column({ type: 'varchar', length: 100 })
  batchNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitCost: number;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date | null;
}
