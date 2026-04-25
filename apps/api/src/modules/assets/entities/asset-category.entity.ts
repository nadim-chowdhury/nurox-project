import { Entity, Column, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Asset } from './asset.entity';

@Entity('asset_categories')
export class AssetCategory extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  depreciationMethod: 'STRAIGHT_LINE' | 'DECLINING_BALANCE';

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  depreciationRate: number; // percentage per year

  @Column({ type: 'int' })
  usefulLifeMonths: number;

  @OneToMany(() => Asset, (asset) => asset.category)
  assets: Asset[];
}
