import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: any;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const secretKey =
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_fake';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any, // Using latest compatible version
    });
  }

  async createCustomer(email: string, name: string): Promise<any> {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    tenantId: string;
    planId: string;
    couponId?: string; // Optional coupon ID
  }): Promise<any> {
    return this.stripe.checkout.sessions.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        tenantId: params.tenantId,
        planId: params.planId,
      },
      subscription_data: {
        metadata: {
          tenantId: params.tenantId,
          planId: params.planId,
        },
      },
      ...(params.couponId && {
        discounts: [{ coupon: params.couponId }],
      }),
    });
  }

  async createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<any> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  constructEventFromPayload(signature: string, payload: Buffer): any {
    const webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || 'whsec_test';
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
