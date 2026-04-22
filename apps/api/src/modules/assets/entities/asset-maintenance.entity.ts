import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Asset } from './asset.entity';

@Entity('asset_maintenances')
export class AssetMaintenance extends BaseEntity {
  @Column({ type: 'uuid' })
  assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.maintenances)
  asset: Asset;

  @Column({ type: 'date' })
  maintenanceDate: Date;

  @Column({ type: 'varchar', length: 100 })
  type: string; // e.g., 'ROUTINE', 'REPAIR'

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  cost: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  technician: string | null;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate: Date | null;
}
