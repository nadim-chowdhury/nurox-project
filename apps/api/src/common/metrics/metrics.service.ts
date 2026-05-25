import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge, Counter } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('active_tenants')
    public readonly activeTenants: Gauge<string>,
    @InjectMetric('queue_depth')
    public readonly queueDepth: Gauge<string>,
    @InjectMetric('cache_hit_rate')
    public readonly cacheHitRate: Gauge<string>,
  ) {}

  setActiveTenants(count: number) {
    this.activeTenants.set(count);
  }

  setQueueDepth(queueName: string, count: number) {
    this.queueDepth.labels(queueName).set(count);
  }

  setCacheHitRate(rate: number) {
    this.cacheHitRate.set(rate);
  }
}
