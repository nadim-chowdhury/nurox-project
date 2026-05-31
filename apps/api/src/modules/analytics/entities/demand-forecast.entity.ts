import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Product } from '../../inventory/entities/product.entity';
import { Warehouse } from '../../inventory/entities/warehouse.entity';

@Entity('demand_forecasts')
export class DemandForecast extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  warehouseId: string | null;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse | null;

  @Column({ type: 'timestamp' })
  forecastDate: Date; // The date for which demand is predicted

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  predictedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  confidenceScore: number; // 0.0 to 1.0

  @Column({ type: 'jsonb', nullable: true })
  seasonalFactors: any; // Factors like holidays, trends

  @Column({ type: 'varchar', length: 50, default: 'MONTHLY' })
  granularity: string; // DAILY, WEEKLY, MONTHLY

  @Column({ type: 'boolean', default: false })
  isLowStockRisk: boolean;

  @Column({ type: 'text', nullable: true })
  aiReasoning: string;
}
