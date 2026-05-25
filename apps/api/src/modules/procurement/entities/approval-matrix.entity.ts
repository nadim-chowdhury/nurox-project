import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('approval_matrices')
export class ApprovalMatrix extends TenantBaseEntity {
  @Column({ type: 'uuid', nullable: true })
  departmentId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxAmount: number | null;

  @Column({ type: 'varchar', length: 50 })
  requiredRole: string; // e.g., MANAGER, DEPT_HEAD, PROCUREMENT
}
