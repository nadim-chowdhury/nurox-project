import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  attributeValues: Record<string, string>; // e.g. { size: 'L', color: 'Blue' }

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  priceAdjustment: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
