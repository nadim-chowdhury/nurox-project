import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('tax_filing_exports')
export class TaxFilingExport extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 10 })
  jurisdiction: string;

  @Column({ type: 'varchar', length: 50 })
  period: string; // e.g. 'Q3-2026', 'OCT-2026'

  @Column({ type: 'jsonb' })
  payload: any; // The structured JSON data exported

  @Column({ type: 'varchar', length: 100 })
  format: string; // 'XML', 'CSV', 'JSON'
}
