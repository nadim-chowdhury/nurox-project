import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { AssetCategory } from './asset-category.entity';
import { AssetAssignment } from './asset-assignment.entity';
import { AssetMaintenance } from './asset-maintenance.entity';
import { Employee } from '../../hr/entities/employee.entity';

@Entity('assets')
export class Asset extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true })
  assetCode: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => AssetCategory, (category) => category.assets)
  category: AssetCategory;

  @Column({ type: 'date' })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  purchaseCost: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string | null;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date | null;

  @Column({ type: 'date', nullable: true })
  insuranceExpiry: Date | null;

  @Column({
    type: 'enum',
    enum: ['PURCHASED', 'ACTIVE', 'UNDER_MAINTENANCE', 'DISPOSED'],
    default: 'PURCHASED',
  })
  status: 'PURCHASED' | 'ACTIVE' | 'UNDER_MAINTENANCE' | 'DISPOSED';

  @Column({ type: 'uuid', nullable: true })
  assignedEmployeeId: string | null;

  @ManyToOne(() => Employee, { nullable: true })
  assignedEmployee: Employee | null;

  @OneToMany(() => AssetAssignment, (assignment) => assignment.asset)
  assignments: AssetAssignment[];

  @OneToMany(() => AssetMaintenance, (maintenance) => maintenance.asset)
  maintenances: AssetMaintenance[];

  @Column({ type: 'date', nullable: true })
  disposalDate: Date | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  disposalPrice: number | null;

  @Column({ type: 'text', nullable: true })
  disposalReason: string | null;
}
