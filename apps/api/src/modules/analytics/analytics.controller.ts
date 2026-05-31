import { Controller, Get, Post, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { ForecastingService } from './services/forecasting.service';
import { InventoryOptimizationService } from './services/inventory-optimization.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CheckModule } from '../../common/guards/module.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckModule('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly forecastingService: ForecastingService,
    private readonly optimizationService: InventoryOptimizationService,
  ) {}

  @Get('dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get main dashboard stats' })
  async getDashboard(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const managerId = user.role === 'MANAGER' ? user.id : undefined;
    return this.analyticsService.getDashboard(startDate, endDate, managerId);
  }

  @Post('forecasting/demand/:productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate demand forecast for a product' })
  async generateForecast(
    @Param('productId') productId: string,
    @Query('months') months?: number,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.forecastingService.generateForecast(
      productId,
      months,
      warehouseId,
    );
  }

  @Get('forecasting/demand/:productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get latest demand forecasts for a product' })
  async getForecasts(
    @Param('productId') productId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.forecastingService.getLatestForecasts(
      productId,
      undefined,
      warehouseId,
    );
  }

  @Get('inventory/optimization-suggestions')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get suggestions for inventory transfers across warehouses',
  })
  async getOptimizationSuggestions() {
    return this.optimizationService.getOptimizationSuggestions();
  }

  @Get('inventory/warehouse-health')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get high-level health stats for all warehouses' })
  async getWarehouseHealth() {
    return this.optimizationService.getCrossWarehouseHealth();
  }

  @Get('kpis')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time KPIs' })
  async getKPIs(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const managerId = user.role === 'MANAGER' ? user.id : undefined;
    return this.analyticsService.getKPIs(startDate, endDate, managerId);
  }

  @Get('alerts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system alerts' })
  async getAlerts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAlerts(startDate, endDate);
  }

  @Get('departments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get department-wise KPIs' })
  async getDepartmentKPIs() {
    return this.analyticsService.getDepartmentKPIs();
  }

  @Get('comparison')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get period comparison' })
  async getComparison(
    @Query('currentStart') currentStart: string,
    @Query('currentEnd') currentEnd: string,
    @Query('prevStart') prevStart: string,
    @Query('prevEnd') prevEnd: string,
  ) {
    return this.analyticsService.getComparison(
      currentStart,
      currentEnd,
      prevStart,
      prevEnd,
    );
  }

  @Get('hr')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get HR specific analytics' })
  async getHRAnalytics() {
    return this.analyticsService.getHRAnalytics();
  }

  @Get('performance-calibration')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get performance rating distribution' })
  async getPerformanceCalibration() {
    return this.analyticsService.getPerformanceCalibration();
  }
}
