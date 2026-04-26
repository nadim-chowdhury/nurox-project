import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('payroll_audits')
export class PayrollAudit extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  payrollRunId: string;

  @Column({ type: 'uuid', nullable: true })
  actorId: string;

  @Column({ type: 'varchar', length: 100 })
  action: string; // e.g., "COMPUTE", "APPROVE", "FINALIZE", "EDIT_PAYSLIP"

  @Column({ type: 'jsonb', nullable: true })
  beforeValue: any;

  @Column({ type: 'jsonb', nullable: true })
  afterValue: any;
}
