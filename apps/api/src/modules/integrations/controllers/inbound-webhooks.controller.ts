import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Req,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as crypto from 'crypto';

@ApiTags('Integrations / Webhooks')
@Controller('webhooks')
export class InboundWebhooksController {
  // Note: For production Stripe webhooks, you usually need the raw buffer
  // In NestJS, you can use raw body middleware for this route specifically.
  @Post('stripe')
  @ApiOperation({ summary: 'Handle incoming Stripe webhooks' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing signature');
    }

    // Actual verification requires raw body. We'll simulate success for now.
    return { received: true };
  }

  @Post('twilio')
  @ApiOperation({ summary: 'Handle incoming Twilio webhooks' })
  async handleTwilioWebhook(
    @Headers('x-twilio-signature') signature: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing signature');
    }

    return { received: true };
  }
}
