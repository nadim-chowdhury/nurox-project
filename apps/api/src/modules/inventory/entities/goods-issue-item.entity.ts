import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { GoodsIssue } from './goods-issue.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('goods_issue_items')
export class GoodsIssueItem extends BaseEntity {
  @Column({ type: 'uuid' })
  goodsIssueId: string;

  @ManyToOne(() => GoodsIssue, (issue) => issue.items)
  @JoinColumn({ name: 'goodsIssueId' })
  goodsIssue: GoodsIssue;

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

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reasonCode: string | null;
}
