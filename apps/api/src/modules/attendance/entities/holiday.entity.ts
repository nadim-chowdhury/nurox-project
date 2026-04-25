import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('holidays')
export class Holiday extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'uuid', nullable: true })
  branchId: string | null;

  @Column({ type: 'boolean', default: true })
  isRecurring: boolean;
}
