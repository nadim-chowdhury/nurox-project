import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Health check endpoint — used by K8s liveness/readiness probes.
 * GET /api/v1/health
 *
 * Returns 200 if all checks pass, 503 if any fail.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check for K8s probes' })
  check() {
    return this.health.check([
      // Database ping
      () => this.db.pingCheck('database'),
      // Memory: RSS should not exceed 512MB
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
      // Disk: should have at least 10% free
      () =>
        this.disk.checkStorage('disk', {
          thresholdPercent: 0.9,
          path: process.platform === 'win32' ? 'C:\\' : '/',
        }),
    ]);
  }
}
