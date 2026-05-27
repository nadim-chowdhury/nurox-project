import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tax_rules')
export class TaxRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 10 })
  jurisdiction: string; // 'BD', 'IN', 'US'

  @Column({ type: 'varchar', length: 100 })
  taxName: string; // e.g. 'VAT', 'CGST', 'FICA'

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  ratePercentage: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
