import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity('workcenters')
export class Workcenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  machineCostPerHour: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  laborCostPerHour: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overheadCostPerHour: number;

  @CreateDateColumn()
  createdAt: Date;
}
