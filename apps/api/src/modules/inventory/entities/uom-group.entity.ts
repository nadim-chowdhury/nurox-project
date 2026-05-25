import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UomConversion } from './uom-conversion.entity';
import { Product } from './product.entity';

@Entity('uom_groups')
export class UomGroup extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @OneToMany(() => UomConversion, (conv) => conv.uomGroup)
  conversions: UomConversion[];

  @OneToMany(() => Product, (prod) => prod.uomGroup)
  products: Product[];
}
