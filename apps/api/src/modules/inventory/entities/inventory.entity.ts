import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Warehouse } from './warehouse.entity';
import { Bin } from './bin.entity';
import { Batch } from './batch.entity';

/**
 * Represents the current stock balance of a specific product/variant
 * in a specific warehouse, bin, and batch.
 */
@Entity('inventory')
@Index(['tenantId', 'productId', 'warehouseId', 'binId', 'batchId'], {
  unique: true,
})
export class Inventory extends TenantBaseEntity {
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

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
}
