import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Warehouse } from './warehouse.entity';
import { Rack } from './rack.entity';

@Entity('zones')
export class Zone extends BaseEntity {
  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.zones)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => Rack, (rack) => rack.zone)
  racks: Rack[];
}
