import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookDeliveryLog } from '../entities/webhook-delivery-log.entity';
import { WebhookEndpoint } from '../entities/webhook-endpoint.entity';
import axios from 'axios';
import * as crypto from 'crypto';

@Processor('webhooks')
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    @InjectRepository(WebhookDeliveryLog)
    private readonly logRepo: Repository<WebhookDeliveryLog>,
    @InjectRepository(WebhookEndpoint)
    private readonly endpointRepo: Repository<WebhookEndpoint>,
  ) {
    super();
  }

  async process(
    job: Job<{ endpointId: string; event: string; payload: any }, any, string>,
  ): Promise<any> {
    const { endpointId, event, payload } = job.data;

    const endpoint = await this.endpointRepo.findOne({
      where: { id: endpointId },
    });
    if (!endpoint || !endpoint.isActive) {
      this.logger.warn(`Webhook endpoint ${endpointId} not found or inactive`);
      return;
    }

    // Prepare payload and signature
    const payloadString = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Nurox-Webhook/1.0',
      'X-Nurox-Event': event,
    };

    if (endpoint.secret) {
      const hmac = crypto.createHmac('sha256', endpoint.secret);
      hmac.update(payloadString);
      headers['X-Nurox-Signature'] = `sha256=${hmac.digest('hex')}`;
    }

    const logEntry = this.logRepo.create({
      tenantId: endpoint.tenantId,
      endpointId,
      event,
      payload,
      attempt: job.attemptsMade + 1,
    });

    try {
      const response = await axios.post(endpoint.url, payloadString, {
        headers,
        timeout: 10000, // 10s timeout
      });

      logEntry.success = true;
      logEntry.statusCode = response.status;
      logEntry.responseBody = JSON.stringify(response.data)?.substring(0, 1000); // Truncate long responses

      await this.logRepo.save(logEntry);

      this.logger.log(
        `Successfully dispatched webhook ${event} to ${endpoint.url}`,
      );
      return { success: true, statusCode: response.status };
    } catch (error: any) {
      logEntry.success = false;
      logEntry.statusCode = error.response?.status || 500;
      logEntry.responseBody = error.response
        ? JSON.stringify(error.response.data)?.substring(0, 1000)
        : error.message;

      await this.logRepo.save(logEntry);

      this.logger.error(
        `Failed to dispatch webhook ${event} to ${endpoint.url}: ${error.message}`,
      );

      // Throwing error triggers BullMQ retry mechanism
      throw error;
    }
  }
}
