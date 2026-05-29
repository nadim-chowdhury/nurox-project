import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('tax_rules')
export class TaxRule extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 10 })
  jurisdiction: string; // 'BD', 'IN', 'US'

  @Column({ type: 'varchar', length: 100 })
  taxName: string; // e.g. 'VAT', 'CGST', 'FICA'

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  ratePercentage: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
