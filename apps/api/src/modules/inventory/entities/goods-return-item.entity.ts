import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { GoodsReturn } from './goods-return.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Batch } from './batch.entity';

@Entity('goods_return_items')
export class GoodsReturnItem extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  goodsReturnId: string;

  @ManyToOne(() => GoodsReturn, (ret) => ret.items)
  @JoinColumn({ name: 'goodsReturnId' })
  goodsReturn: GoodsReturn;

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

  @Column({ type: 'varchar', length: 50, nullable: true })
  reasonCode: string | null;
}
