import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DemandForecast } from '../entities/demand-forecast.entity';
import { Product } from '../../inventory/entities/product.entity';
import {
  StockMovement,
  StockMovementType,
} from '../../inventory/entities/stock-movement.entity';
import { AiService } from '../../ai/services/ai.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ForecastingService {
  private readonly logger = new Logger(ForecastingService.name);

  constructor(
    @InjectRepository(DemandForecast)
    private readonly forecastRepo: Repository<DemandForecast>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    private readonly aiService: AiService,
    private readonly cls: ClsService,
  ) {}

  async generateForecast(
    productId: string,
    monthsAhead: number = 3,
    warehouseId?: string,
  ) {
    const tenantId = this.cls.get('tenantId');
    const product = await this.productRepo.findOne({
      where: { id: productId, tenantId },
    });
    if (!product) throw new Error('Product not found');

    // 1. Aggregate historical sales (StockMovementType.ISSUE)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const history = await this.movementRepo.find({
      where: {
        productId,
        tenantId,
        type: StockMovementType.ISSUE,
        warehouseId: warehouseId || undefined,
        createdAt: Between(sixMonthsAgo, new Date()),
      },
      order: { createdAt: 'ASC' },
    });

    // Group by month
    const monthlyHistory: Record<string, number> = {};
    history.forEach((m) => {
      const month = m.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyHistory[month] =
        (monthlyHistory[month] || 0) + Math.abs(Number(m.quantity));
    });

    // 2. Call AI for prediction
    let contextStr = `Product: ${product.name} (SKU: ${product.sku})`;
    if (warehouseId) {
      contextStr += ` for Warehouse ID: ${warehouseId}`;
    }

    const prompt = `
      As an ERP inventory expert, predict demand for the next ${monthsAhead} months for the following product:
      ${contextStr}
      Historical Monthly Sales (last 6 months):
      ${JSON.stringify(monthlyHistory)}

      Provide a JSON response with:
      - forecasts: [{ date: "YYYY-MM-DD", predictedQuantity: number, confidence: number }]
      - reasoning: string (explaining trends or seasonal factors)
      - riskLevel: "LOW" | "MEDIUM" | "HIGH" (based on volatility)
    `;

    try {
      const aiResponse = await this.aiService.generateText({
        prompt,
        type: 'analytics',
        maxTokens: 500,
      });

      // Simple JSON extractor (in case AI adds markdown blocks)
      const jsonStr = aiResponse.match(/\{[\s\S]*\}/)?.[0] || aiResponse;
      const result = JSON.parse(jsonStr);

      // 3. Store forecasts
      const savedForecasts = [];
      for (const f of result.forecasts) {
        const forecast = this.forecastRepo.create({
          tenantId,
          productId,
          warehouseId: warehouseId || null,
          forecastDate: new Date(f.date),
          predictedQuantity: f.predictedQuantity,
          confidenceScore: f.confidence,
          aiReasoning: result.reasoning,
          granularity: 'MONTHLY',
        });
        savedForecasts.push(await this.forecastRepo.save(forecast));
      }

      return {
        product,
        forecasts: savedForecasts,
        reasoning: result.reasoning,
        riskLevel: result.riskLevel,
      };
    } catch (error) {
      this.logger.error(`Forecasting failed for ${product.sku}`, error);
      throw error;
    }
  }

  async getLatestForecasts(
    productId: string,
    tenantId?: string,
    warehouseId?: string,
  ) {
    const tid = tenantId ?? this.cls.get('tenantId');
    return this.forecastRepo.find({
      where: {
        productId,
        tenantId: tid,
        warehouseId: warehouseId || IsNull(),
      },
      order: { forecastDate: 'ASC' },
      take: 12,
    });
  }
}
