import { Entity, Column, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { UomConversion } from './uom-conversion.entity';
import { Product } from './product.entity';

@Entity('uom_groups')
export class UomGroup extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @OneToMany(() => UomConversion, (conv) => conv.uomGroup)
  conversions: UomConversion[];

  @OneToMany(() => Product, (prod) => prod.uomGroup)
  products: Product[];
}
