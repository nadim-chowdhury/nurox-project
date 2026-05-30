import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('accounts')
export class Account extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  annualRevenue: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  taxBin: string | null;

  @Column({ type: 'text', nullable: true })
  billingAddress: string | null;
}
