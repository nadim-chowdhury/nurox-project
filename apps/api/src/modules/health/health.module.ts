import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * Health module — provides /api/health endpoints for:
 * - Kubernetes liveness probes (GET /api/health/liveness)
 * - Kubernetes readiness probes (GET /api/health/readiness)
 * - Full health report (GET /api/health)
 *
 * This module should be imported in AppModule and excluded from
 * auth guards, tenant middleware, and API versioning.
 */
@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
