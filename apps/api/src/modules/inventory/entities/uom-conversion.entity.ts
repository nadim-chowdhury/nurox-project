import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UomGroup } from './uom-group.entity';

@Entity('uom_conversions')
export class UomConversion extends BaseEntity {
  @Column({ type: 'uuid' })
  uomGroupId: string;

  @ManyToOne(() => UomGroup, (group) => group.conversions)
  @JoinColumn({ name: 'uomGroupId' })
  uomGroup: UomGroup;

  @Column({ type: 'varchar', length: 20 })
  fromUom: string;

  @Column({ type: 'varchar', length: 20 })
  toUom: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  conversionFactor: number;
}
