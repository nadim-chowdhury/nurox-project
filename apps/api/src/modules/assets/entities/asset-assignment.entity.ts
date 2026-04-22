import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Asset } from './asset.entity';
import { Employee } from '../../hr/entities/employee.entity';

@Entity('asset_assignments')
export class AssetAssignment extends BaseEntity {
  @Column({ type: 'uuid' })
  assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.assignments)
  asset: Asset;

  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  employee: Employee;

  @Column({ type: 'date' })
  assignmentDate: Date;

  @Column({ type: 'date', nullable: true })
  returnDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
