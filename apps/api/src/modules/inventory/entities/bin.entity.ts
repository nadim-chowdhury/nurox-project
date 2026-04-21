import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Rack } from './rack.entity';

@Entity('bins')
export class Bin extends BaseEntity {
  @Column({ type: 'uuid' })
  rackId: string;

  @ManyToOne(() => Rack, (rack) => rack.bins)
  @JoinColumn({ name: 'rackId' })
  rack: Rack;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  capacity: number | null;
}
