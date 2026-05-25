import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('report_templates')
export class ReportTemplate extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  module: string; // e.g., 'HR', 'FINANCE', 'INVENTORY'

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 100 })
  entityName: string; // e.g., 'Employee', 'Invoice'

  @Column({ type: 'jsonb' })
  config: {
    columns: { key: string; label: string; type?: string }[];
    filters: { key: string; operator: string; value: any }[];
    grouping?: string[];
    aggregations?: {
      key: string;
      type: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
    }[];
    joins?: { entity: string; condition: string }[];
    sorting?: { key: string; order: 'ASC' | 'DESC' }[];
  };

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @Column({ type: 'simple-array', nullable: true })
  rolesAllowed: string[];
}
