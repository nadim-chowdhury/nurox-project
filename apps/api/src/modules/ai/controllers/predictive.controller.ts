import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/predictive')
export class PredictiveAnalyticsController {
  @Get('churn-risk')
  getChurnRiskScoring(@CurrentTenant() tenantId: string) {
    // Stub: Returns employees at high risk of churning based on attendance/leaves
    return [
      {
        employeeId: 'emp-101',
        name: 'Alice Smith',
        riskScore: 85,
        keyFactors: ['Unusual attendance pattern', 'Low survey score'],
      },
      {
        employeeId: 'emp-204',
        name: 'Bob Johnson',
        riskScore: 72,
        keyFactors: ['High leave frequency recently'],
      },
    ];
  }

  @Get('sales-forecast')
  getSalesForecast(@CurrentTenant() tenantId: string) {
    // Stub: Returns time-series forecasting data for Q4
    return {
      period: 'Q4-2026',
      projectedRevenue: 1250000,
      confidenceInterval: [1100000, 1400000],
      trend: 'UP',
      pipelineConversionRatePrediction: 0.18, // 18% predicted conversion
    };
  }

  @Get('stock-reorder')
  getPredictiveStockReorder(@CurrentTenant() tenantId: string) {
    // Stub: Returns ML-based simple regression for stock depletion
    return [
      {
        itemId: 'item-1',
        name: 'MacBook Pro M3',
        currentStock: 12,
        predictedDepletionDays: 14,
        recommendedReorderQty: 25,
      },
      {
        itemId: 'item-2',
        name: 'Office Chair',
        currentStock: 4,
        predictedDepletionDays: 5,
        recommendedReorderQty: 50,
      },
    ];
  }
}
