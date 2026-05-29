import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('currency_rates')
@Index(['baseCurrency', 'targetCurrency', 'rateDate'], { unique: true })
export class CurrencyRate extends BaseEntity {
  @Column({ type: 'varchar', length: 3 })
  baseCurrency: string;

  @Column({ type: 'varchar', length: 3 })
  targetCurrency: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  rate: number;

  @Column({ type: 'date' })
  rateDate: string;

  @CreateDateColumn()
  createdAt: Date;
}
