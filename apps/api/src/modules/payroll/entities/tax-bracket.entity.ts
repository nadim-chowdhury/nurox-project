import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('tax_configurations')
export class TaxConfiguration extends BaseEntity {
  @Column({ type: 'varchar', length: 10, unique: true })
  fiscalYear: string; // e.g., "2025-26"

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  taxExemptThreshold: number; // e.g., 350000 for BD

  @OneToMany(() => TaxBracket, (b) => b.taxConfiguration, { cascade: true })
  brackets: TaxBracket[];

  @Column({ type: 'boolean', default: false })
  isActive: boolean;
}

@Entity('tax_brackets')
export class TaxBracket extends BaseEntity {
  @Column({ type: 'uuid' })
  taxConfigurationId: string;

  @ManyToOne(() => TaxConfiguration, (tc) => tc.brackets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taxConfigurationId' })
  taxConfiguration: TaxConfiguration;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  upperLimit: number | null; // null for the highest bracket

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number; // Percentage, e.g., 5.00
}
