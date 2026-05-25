import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Batch } from './batch.entity';

export enum SerialNumberStatus {
  IN_STOCK = 'IN_STOCK',
  ISSUED = 'ISSUED',
  RETURNED = 'RETURNED',
}

@Entity('serial_numbers')
export class SerialNumber extends BaseEntity {
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
  batchId: string | null;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batchId' })
  batch: Batch | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  serial: string;

  @Column({ type: 'enum', enum: SerialNumberStatus, default: SerialNumberStatus.IN_STOCK })
  status: SerialNumberStatus;
}
