import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductVariant } from './product-variant.entity';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum ValuationMethod {
  FIFO = 'FIFO',
  LIFO = 'LIFO',
  WEIGHTED_AVERAGE = 'WEIGHTED_AVERAGE',
  FEFO = 'FEFO',
}

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 20, default: 'PCS' })
  uom: string; // Unit of Measure

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basePrice: number;

  @Column({ type: 'int', default: 0 })
  reorderPoint: number;

  @Column({ type: 'uuid', nullable: true })
  taxClassId: string | null;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({
    type: 'enum',
    enum: ValuationMethod,
    default: ValuationMethod.FIFO,
  })
  valuationMethod: ValuationMethod;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];
}
