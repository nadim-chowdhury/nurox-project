import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('tax_filing_exports')
export class TaxFilingExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 10 })
  jurisdiction: string;

  @Column({ type: 'varchar', length: 50 })
  period: string; // e.g. 'Q3-2026', 'OCT-2026'

  @Column({ type: 'jsonb' })
  payload: any; // The structured JSON data exported

  @Column({ type: 'varchar', length: 100 })
  format: string; // 'XML', 'CSV', 'JSON'

  @CreateDateColumn()
  createdAt: Date;
}
