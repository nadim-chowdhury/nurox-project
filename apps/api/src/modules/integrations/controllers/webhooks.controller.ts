import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';

@Controller('integrations/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor() {}

  @Post('shopify')
  async handleShopifyWebhook(
    @Headers('x-shopify-topic') topic: string,
    @Headers('x-shopify-shop-domain') shopDomain: string,
    @Body() payload: any,
  ) {
    this.logger.log(`Received Shopify Webhook: ${topic} from ${shopDomain}`);

    // In production, we would verify the HMAC signature here
    // const hmac = headers['x-shopify-hmac-sha256'];

    if (topic === 'orders/create') {
      // Map Shopify order payload to Nurox SalesOrder entity
      this.logger.log(`Processing Shopify Order #${payload.id}`);
      // return this.salesService.createOrderFromExternal(...)
    } else if (topic === 'products/update') {
      this.logger.log(`Syncing Shopify Product update for ID: ${payload.id}`);
    }

    return { status: 'acknowledged' };
  }

  @Post('woocommerce')
  async handleWooCommerceWebhook(
    @Headers('x-wc-webhook-topic') topic: string,
    @Headers('x-wc-webhook-source') source: string,
    @Body() payload: any,
  ) {
    this.logger.log(`Received WooCommerce Webhook: ${topic} from ${source}`);

    // In production, verify the webhook secret signature

    if (topic === 'order.created') {
      this.logger.log(`Processing WooCommerce Order #${payload.id}`);
    }

    return { status: 'acknowledged' };
  }
}
