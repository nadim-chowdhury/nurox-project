import { Controller, Get, UseGuards } from '@nestjs/common';
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
  async getDashboard() {
    return this.analyticsService.getDashboard();
  }

  @Get('kpis')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time KPIs' })
  async getKPIs() {
    return this.analyticsService.getKPIs();
  }

  @Get('alerts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system alerts' })
  async getAlerts() {
    return this.analyticsService.getAlerts();
  }
}
