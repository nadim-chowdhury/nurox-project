import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../../system/entities/tenant.entity';
import { BomItem } from './bom-item.entity';

@Entity('boms')
export class Bom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  finishedProductId: string; // Refers to an inventory item

  @Column({ type: 'varchar', length: 50, default: 'v1.0' })
  version: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => BomItem, (item) => item.bom, { cascade: true })
  items: BomItem[];

  @CreateDateColumn()
  createdAt: Date;
}
