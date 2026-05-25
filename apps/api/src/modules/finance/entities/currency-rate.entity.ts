import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('currency_rates')
@Index(['baseCurrency', 'targetCurrency', 'rateDate'], { unique: true })
export class CurrencyRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
