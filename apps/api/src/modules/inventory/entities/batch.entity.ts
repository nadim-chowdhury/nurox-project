import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('batches')
export class Batch extends BaseEntity {
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

  @Column({ type: 'varchar', length: 50 })
  batchNumber: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiryDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  manufactureDate: Date | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  receivedDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  initialQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  remainingQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitCost: number;
}
