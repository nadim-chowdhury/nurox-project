import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('pricelists')
export class Pricelist extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  validFrom: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  validTo: Date | null;

  @OneToMany(() => PricelistItem, (item) => item.pricelist, { cascade: true })
  items: PricelistItem[];
}

@Entity('pricelist_items')
export class PricelistItem extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  pricelistId: string;

  @ManyToOne(() => Pricelist, (pl) => pl.items)
  @JoinColumn({ name: 'pricelistId' })
  pricelist: Pricelist;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  variantId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  overridePrice: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent: number | null;
}
