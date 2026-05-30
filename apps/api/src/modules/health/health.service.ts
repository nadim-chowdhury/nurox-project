import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: ComponentHealth;
    redis: ComponentHealth;
    memory: ComponentHealth;
  };
}

interface ComponentHealth {
  status: 'up' | 'down';
  responseTime?: number;
  details?: Record<string, unknown>;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private redis: Redis | null = null;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {
    // Create a separate Redis connection for health checks
    const redisHost = this.config.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.config.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.config.get<string>('REDIS_PASSWORD', '');

    try {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword || undefined,
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        lazyConnect: true,
      });
    } catch {
      this.logger.warn('Redis health check client failed to initialize');
    }
  }

  async check(): Promise<HealthCheckResult> {
    const [database, redis, memory] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      Promise.resolve(this.checkMemory()),
    ]);

    const allUp =
      database.status === 'up' &&
      redis.status === 'up' &&
      memory.status === 'up';
    const allDown = database.status === 'down' && redis.status === 'down';

    return {
      status: allDown ? 'unhealthy' : allUp ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.0.1',
      checks: { database, redis, memory },
    };
  }

  private async checkDatabase(): Promise<ComponentHealth> {
    const start = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'up',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'down',
        responseTime: Date.now() - start,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async checkRedis(): Promise<ComponentHealth> {
    if (!this.redis) {
      return {
        status: 'down',
        details: { error: 'Redis client not initialized' },
      };
    }

    const start = Date.now();
    try {
      await this.redis.ping();
      return {
        status: 'up',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return {
        status: 'down',
        responseTime: Date.now() - start,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private checkMemory(): ComponentHealth {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
    const rssMB = Math.round(used.rss / 1024 / 1024);

    // Flag as unhealthy if heap exceeds 90% utilization
    const heapPercent = (used.heapUsed / used.heapTotal) * 100;
    const isHealthy = heapPercent < 90;

    return {
      status: isHealthy ? 'up' : 'down',
      details: {
        heapUsedMB,
        heapTotalMB,
        heapPercent: Math.round(heapPercent),
        rssMB,
      },
    };
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
