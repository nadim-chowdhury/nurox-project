import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationsGateway } from './gateways/notifications.gateway';

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
    private dataSource: DataSource,
    private redis: RedisService,
    private notificationsGateway: NotificationsGateway,
    @InjectQueue('hr') private hrQueue: Queue,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Detailed system health check' })
  check() {
    return this.health.check([
      // 1. Database
      () => this.db.pingCheck('database'),
      
      // 2. Database Pool Stats
      async (): Promise<HealthIndicatorResult> => {
        const pool = (this.dataSource.driver as any).master;
        return {
          db_pool: {
            status: 'up',
            totalConnections: pool?.totalCount || 0,
            idleConnections: pool?.idleCount || 0,
            waitingRequests: pool?.waitingCount || 0,
          },
        };
      },

      // 3. Redis Stats
      async (): Promise<HealthIndicatorResult> => {
        try {
          const info = await this.redis.getClient().info('memory');
          const usedMemory = info.match(/used_memory_human:(.*)/)?.[1] || 'unknown';
          return {
            redis: {
              status: 'up',
              usedMemory,
            },
          };
        } catch (e) {
          return { redis: { status: 'down', message: e.message } };
        }
      },

      // 4. BullMQ Queue Depths
      async (): Promise<HealthIndicatorResult> => {
        const count = await this.hrQueue.count();
        return {
          queues: {
            status: 'up',
            hr_queue_depth: count,
          },
        };
      },

      // 5. WebSocket Connections
      async (): Promise<HealthIndicatorResult> => {
        const count = this.notificationsGateway.server?.engine.clientsCount || 0;
        return {
          websockets: {
            status: 'up',
            activeConnections: count,
          },
        };
      },

      // 6. Memory
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
      
      // 7. Disk
      () =>
        this.disk.checkStorage('disk', {
          thresholdPercent: 0.9,
          path: process.platform === 'win32' ? 'C:\\' : '/',
        }),
    ]);
  }
}
