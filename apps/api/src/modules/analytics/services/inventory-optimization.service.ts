import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../inventory/entities/product.entity';
import { Warehouse } from '../../inventory/entities/warehouse.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { ForecastingService } from './forecasting.service';
import { ClsService } from 'nestjs-cls';

export interface OptimizationSuggestion {
  productId: string;
  productName: string;
  sku: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  suggestedQuantity: number;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class InventoryOptimizationService {
  private readonly logger = new Logger(InventoryOptimizationService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    private readonly forecastingService: ForecastingService,
    private readonly cls: ClsService,
  ) {}

  async getOptimizationSuggestions(): Promise<OptimizationSuggestion[]> {
    const tenantId = this.cls.get('tenantId');
    const products = await this.productRepo.find({ where: { tenantId } });
    const warehouses = await this.warehouseRepo.find({ where: { tenantId } });
    const suggestions: OptimizationSuggestion[] = [];

    for (const product of products) {
      const stockLevels = await this.inventoryRepo.find({
        where: { productId: product.id, tenantId },
        relations: ['warehouse'],
      });

      // Group stock by warehouse
      const warehouseStock: Record<string, number> = {};
      stockLevels.forEach((s) => {
        warehouseStock[s.warehouseId] =
          (warehouseStock[s.warehouseId] || 0) + Number(s.quantity);
      });

      const warehouseAnalysis: any[] = [];

      for (const warehouse of warehouses) {
        const currentStock = warehouseStock[warehouse.id] || 0;

        // Get localized forecast
        const forecasts = await this.forecastingService.getLatestForecasts(
          product.id,
          tenantId,
          warehouse.id,
        );

        // Total predicted demand for next 30 days
        const next30Days = new Date();
        next30Days.setDate(next30Days.getDate() + 30);
        const predictedDemand = forecasts
          .filter((f) => f.forecastDate <= next30Days)
          .reduce((sum, f) => sum + Number(f.predictedQuantity), 0);

        const safetyStock = product.reorderPoint || 0;
        const targetLevel = predictedDemand + safetyStock;
        const diff = currentStock - targetLevel;

        warehouseAnalysis.push({
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          currentStock,
          predictedDemand,
          targetLevel,
          diff, // Positive means surplus, negative means deficit
        });
      }

      // Identify Surplus and Deficit warehouses
      const surplus = warehouseAnalysis
        .filter((a) => a.diff > 0)
        .sort((a, b) => b.diff - a.diff);
      const deficit = warehouseAnalysis
        .filter((a) => a.diff < 0)
        .sort((a, b) => a.diff - b.diff);

      for (const target of deficit) {
        let remainingNeeded = Math.abs(target.diff);

        for (const source of surplus) {
          if (remainingNeeded <= 0) break;
          if (source.diff <= 0) continue;

          const transferQty = Math.min(remainingNeeded, source.diff);
          if (transferQty > 0) {
            suggestions.push({
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              sourceWarehouseId: source.warehouseId,
              sourceWarehouseName: source.warehouseName,
              targetWarehouseId: target.warehouseId,
              targetWarehouseName: target.warehouseName,
              suggestedQuantity: Math.ceil(transferQty),
              reason: `Transfer from surplus in ${source.warehouseName} to meet predicted demand + safety stock in ${target.warehouseName}.`,
              priority:
                Math.abs(target.diff) > target.targetLevel * 0.5
                  ? 'HIGH'
                  : 'MEDIUM',
            });

            source.diff -= transferQty;
            remainingNeeded -= transferQty;
          }
        }
      }
    }

    return suggestions;
  }

  async getCrossWarehouseHealth() {
    const tenantId = this.cls.get('tenantId');
    const warehouses = await this.warehouseRepo.find({ where: { tenantId } });

    const health = await Promise.all(
      warehouses.map(async (wh) => {
        const stock = await this.inventoryRepo
          .createQueryBuilder('inv')
          .where('inv.warehouseId = :whid', { whid: wh.id })
          .andWhere('inv.tenantId = :tenantId', { tenantId })
          .select('SUM(inv.quantity)', 'totalStock')
          .addSelect('COUNT(DISTINCT inv.productId)', 'uniqueProducts')
          .getRawOne();

        return {
          warehouseId: wh.id,
          name: wh.name,
          totalStock: Number(stock.totalStock || 0),
          uniqueProducts: Number(stock.uniqueProducts || 0),
        };
      }),
    );

    return health;
  }
}
