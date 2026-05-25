import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('bank_accounts')
export class BankAccount extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 150 })
  accountName: string;

  @Column({ type: 'varchar', length: 50 })
  accountNumber: string;

  @Column({ type: 'varchar', length: 100 })
  bankName: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  iban: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  swiftCode: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  glAccountId: string | null;
}
