import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Zone } from './zone.entity';
import { Bin } from './bin.entity';

@Entity('racks')
export class Rack extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  zoneId: string;

  @ManyToOne(() => Zone, (zone) => zone.racks)
  @JoinColumn({ name: 'zoneId' })
  zone: Zone;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => Bin, (bin) => bin.rack)
  bins: Bin[];
}
