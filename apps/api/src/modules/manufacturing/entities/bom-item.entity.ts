import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Bom } from './bom.entity';

@Entity('bom_items')
export class BomItem extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  bomId: string;

  @ManyToOne(() => Bom, (bom) => bom.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bomId' })
  bom: Bom;

  @Column({ type: 'uuid' })
  componentProductId: string; // The raw material or sub-assembly

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  unitOfMeasure: string;
}
