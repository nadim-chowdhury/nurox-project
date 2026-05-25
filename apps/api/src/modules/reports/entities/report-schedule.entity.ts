import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { ReportTemplate } from './report-template.entity';

@Entity('report_schedules')
export class ReportSchedule extends TenantBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  templateId: string;

  @ManyToOne(() => ReportTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: ReportTemplate;

  @Column({ type: 'varchar', length: 100 })
  cronExpression: string; // e.g. "0 0 1 * *"

  @Column({ type: 'simple-array' })
  recipients: string[]; // List of emails

  @Column({ type: 'varchar', length: 20, default: 'PDF' })
  format: 'PDF' | 'XLSX' | 'CSV';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
