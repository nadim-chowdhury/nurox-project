import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get main dashboard stats' })
  async getDashboard(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getDashboard(startDate, endDate);
  }

  @Get('kpis')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time KPIs' })
  async getKPIs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getKPIs(startDate, endDate);
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
}
