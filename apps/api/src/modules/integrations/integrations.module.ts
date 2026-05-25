import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookDeliveryLog } from './entities/webhook-delivery-log.entity';
import { WebhookProcessor } from './processors/webhook.processor';
import { InboundWebhooksController } from './controllers/inbound-webhooks.controller';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEndpoint, WebhookDeliveryLog]),
    BullModule.registerQueue({
      name: 'webhooks',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000, // 1s, 2s, 4s, 8s, 16s...
        },
      },
    }),
    BullBoardModule.forFeature({
      name: 'webhooks',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [InboundWebhooksController],
  providers: [WebhookProcessor],
  exports: [TypeOrmModule, BullModule],
})
export class IntegrationsModule {}
