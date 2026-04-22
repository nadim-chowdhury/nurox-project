import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('report_templates')
export class ReportTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 50 })
  module: string; // e.g., 'HR', 'FINANCE', 'INVENTORY'

  @Column({ type: 'varchar', length: 100 })
  entityName: string; // e.g., 'Employee', 'Invoice'

  @Column({ type: 'jsonb' })
  config: {
    columns: { key: string; label: string; type?: string }[];
    filters: { key: string; operator: string; value: any }[];
    grouping?: string[];
    sorting?: { key: string; order: 'ASC' | 'DESC' }[];
  };

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;
}
