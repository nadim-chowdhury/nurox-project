import { Controller, Get, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RedisService } from '../redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

// Normally you'd have a SuperAdminGuard checking for a SaaS-level admin flag
// @UseGuards(SuperAdminGuard)
@ApiTags('Super Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('superadmin')
export class SuperAdminController {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    private readonly dataSource: DataSource,
  ) {}

  @Get('tenants')
  @ApiOperation({ summary: 'List all tenants in the system' })
  async getTenants() {
    return this.tenantRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  @Post('maintenance')
  @ApiOperation({ summary: 'Toggle global maintenance mode' })
  async toggleMaintenance(@Body() body: { enabled: boolean }) {
    if (body.enabled) {
      await this.redisService.set('global:maintenance', 'true');
    } else {
      await this.redisService.del('global:maintenance');
    }
    return { success: true, maintenance: body.enabled };
  }

  @Get('health')
  @ApiOperation({ summary: 'Get global system health metrics' })
  async getSystemHealth() {
    // Collect some basic metrics
    const totalTenants = await this.tenantRepo.count();

    // Memory info
    const memUsage = process.memoryUsage();

    // Simulated websocket connections (in a real app, query Socket.io adapter)
    const activeWebsockets = Math.floor(Math.random() * 100);

    return {
      tenants: totalTenants,
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      },
      activeWebsockets,
      status: 'HEALTHY',
    };
  }
}
