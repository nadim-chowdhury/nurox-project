import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Bom } from './bom.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('bom_items')
export class BomItem extends BaseEntity {
  @Column({ type: 'uuid' })
  bomId: string;

  @ManyToOne(() => Bom, (bom) => bom.items)
  @JoinColumn({ name: 'bomId' })
  bom: Bom;

  @Column({ type: 'uuid' })
  componentProductId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'componentProductId' })
  componentProduct: Product;

  @Column({ type: 'uuid', nullable: true })
  componentVariantId: string | null;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'componentVariantId' })
  componentVariant: ProductVariant | null;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  uom: string;
}
