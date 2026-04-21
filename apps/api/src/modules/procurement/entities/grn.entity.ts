import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from '../../inventory/entities/product.entity';
import { ProductVariant } from '../../inventory/entities/product-variant.entity';

export enum GrnStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('grns')
export class Grn extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  grnNumber: string;

  @Column({ type: 'uuid' })
  poId: string;

  @ManyToOne(() => PurchaseOrder)
  @JoinColumn({ name: 'poId' })
  purchaseOrder: PurchaseOrder;

  @Column({ type: 'timestamptz' })
  receivedDate: Date;

  @Column({ type: 'uuid' })
  receivedById: string;

  @Column({ type: 'enum', enum: GrnStatus, default: GrnStatus.PENDING })
  status: GrnStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => GrnLine, (line) => line.grn, { cascade: true })
  lines: GrnLine[];
}

@Entity('grn_lines')
export class GrnLine extends BaseEntity {
  @Column({ type: 'uuid' })
  grnId: string;

  @ManyToOne(() => Grn, (grn) => grn.lines)
  @JoinColumn({ name: 'grnId' })
  grn: Grn;

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
  poLineId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  receivedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  unitCost: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchNumber: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiryDate: Date | null;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @Column({ type: 'uuid', nullable: true })
  binId: string | null;
}
