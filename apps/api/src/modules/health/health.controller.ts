import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * Health check endpoint — excluded from auth, versioning, and tenant middleware.
 * Used by Kubernetes liveness/readiness probes, load balancers, and monitoring.
 *
 * GET /api/health → full health report
 */
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.check();
  }

  @Get('liveness')
  liveness() {
    // Simple liveness — if this responds, the process is alive
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  async readiness() {
    return this.healthService.check();
  }
}
