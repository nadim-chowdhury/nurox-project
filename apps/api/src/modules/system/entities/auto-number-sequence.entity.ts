import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('auto_number_sequences')
export class AutoNumberSequence extends TenantBaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 50 })
  documentType: string; // e.g., 'INVOICE', 'EMPLOYEE', 'PO'

  @Column({ type: 'varchar', length: 20, nullable: true })
  prefix: string; // e.g., 'INV-'

  @Column({ type: 'varchar', length: 20, nullable: true })
  suffix: string; // e.g., '-2024'

  @Column({ type: 'int', default: 4 })
  padding: number; // e.g., 4 -> '0001'

  @Column({ type: 'int', default: 1 })
  nextValue: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
