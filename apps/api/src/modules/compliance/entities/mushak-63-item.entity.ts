import { Entity, Column, ManyToOne } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Mushak63 } from './mushak-63.entity';

@Entity('mushak_63_items')
export class Mushak63Item extends TenantBaseEntity {
  @ManyToOne(() => Mushak63, (mushak) => mushak.items, { onDelete: 'CASCADE' })
  mushak63: Mushak63;

  @Column({ type: 'varchar', length: 255 })
  itemName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  hsCode: string;

  @Column({ type: 'varchar', length: 50 })
  unitOfSupply: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPriceExclTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sdRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sdAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmountInclTax: number;
}
