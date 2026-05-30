import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  Headers,
  RawBodyRequest,
  UseGuards,
  Param,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { SslcommerzService } from '../services/sslcommerz.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { TenantSubscription } from '../entities/tenant-subscription.entity';
import { Invoice } from '../entities/invoice.entity';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import {
  CheckoutRequestDto,
  checkoutRequestSchema,
} from '@repo/shared-schemas';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly sslcommerzService: SslcommerzService,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(TenantSubscription)
    private readonly subscriptionRepo: Repository<TenantSubscription>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectQueue('billing')
    private readonly billingQueue: Queue,
  ) {}

  @Get('plans')
  async getPlans() {
    return this.planRepo.find({ where: { isActive: true } });
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('subscription')
  async getCurrentSubscription(@CurrentTenant() tenantId: string) {
    return this.subscriptionRepo.findOne({
      where: { tenantId },
      relations: ['plan'],
    });
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('invoices')
  async getInvoices(@CurrentTenant() tenantId: string) {
    const invoices = await this.invoiceRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return { data: invoices, total: invoices.length };
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('checkout')
  async createCheckoutSession(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CheckoutRequestDto,
  ) {
    const plan = await this.planRepo.findOneBy({ id: dto.planId });
    if (!plan) throw new Error('Plan not found');

    let sub = await this.subscriptionRepo.findOneBy({ tenantId });
    if (!sub) {
      sub = this.subscriptionRepo.create({
        tenantId,
        planId: plan.id,
        status: 'incomplete',
      });
      // Optionally create Stripe customer here if not exists
      const customer = await this.stripeService.createCustomer(
        user.email,
        user.name || 'Tenant Admin',
      );
      sub.stripeCustomerId = customer.id;
      await this.subscriptionRepo.save(sub);
    }

    if (dto.paymentProvider === 'stripe') {
      const priceId = dto.isAnnual
        ? plan.stripeProductId /* handle price correctly */
        : plan.stripeProductId;

      const session = await this.stripeService.createCheckoutSession({
        customerId: sub.stripeCustomerId,
        priceId: priceId || 'price_mock',
        successUrl: dto.successUrl,
        cancelUrl: dto.cancelUrl,
        tenantId,
        planId: plan.id,
      });

      return { url: session.url };
    } else if (dto.paymentProvider === 'sslcommerz') {
      const url = await this.sslcommerzService.initiatePayment({
        tenantId,
        amount: dto.isAnnual ? plan.annualPrice : plan.monthlyPrice,
        currency: plan.currency,
        tranId: `TRN_${Date.now()}`,
        successUrl: dto.successUrl,
        failUrl: dto.cancelUrl,
        cancelUrl: dto.cancelUrl,
        customerName: user.name || 'Admin',
        customerEmail: user.email,
        customerPhone: '01700000000',
      });
      return { url };
    }
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('portal')
  async createCustomerPortalSession(
    @CurrentTenant() tenantId: string,
    @Body() body: { returnUrl: string },
  ) {
    const sub = await this.subscriptionRepo.findOneBy({ tenantId });
    if (!sub || !sub.stripeCustomerId) {
      throw new Error('No Stripe customer associated with this tenant');
    }

    const session = await this.stripeService.createBillingPortalSession(
      sub.stripeCustomerId,
      body.returnUrl,
    );

    return { url: session.url };
  }

  @Post('webhook/stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    try {
      const event = this.stripeService.constructEventFromPayload(
        signature,
        req.rawBody!,
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (session.metadata?.tenantId) {
            await this.subscriptionRepo.update(
              { tenantId: session.metadata.tenantId },
              { status: 'active', stripeSubscriptionId: session.subscription },
            );
          }
          break;
        }
        case 'invoice.paid': {
          const invoice = event.data.object;
          if (invoice.subscription) {
            await this.subscriptionRepo.update(
              { stripeSubscriptionId: invoice.subscription },
              { status: 'active' },
            );
          }
          break;
        }
        case 'invoice.payment_failed': {
          const failedInvoice = event.data.object;
          if (failedInvoice.subscription) {
            const sub = await this.subscriptionRepo.findOne({
              where: { stripeSubscriptionId: failedInvoice.subscription },
              relations: ['tenant'],
            });
            if (sub) {
              sub.status =
                failedInvoice.attempt_count >= 3 ? 'suspended' : 'past_due';
              await this.subscriptionRepo.save(sub);
            }
          }
          break;
        }
      }

      res.status(200).send({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  @Post('webhook/sslcommerz')
  async handleSslCommerzIpn(@Body() payload: any, @Res() res: Response) {
    const isValid = this.sslcommerzService.validateIpn(payload);
    if (isValid) {
      // Process successful payment, upgrade tenant plan
    }
    res.status(200).send('OK');
  }

  @Post('freeze')
  async freezeAccount(@Req() req: any) {
    const tenantId = req.tenantId;
    if (!tenantId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    const subscription = await this.subscriptionRepo.findOne({
      where: { tenantId },
    });
    if (!subscription)
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);

    subscription.status = 'frozen';
    await this.subscriptionRepo.save(subscription);

    return { success: true, message: 'Account frozen successfully' };
  }

  @Post('reactivate')
  async reactivateAccount(@Req() req: any) {
    const tenantId = req.tenantId;
    if (!tenantId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    const subscription = await this.subscriptionRepo.findOne({
      where: { tenantId },
    });
    if (!subscription)
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);

    subscription.status = 'active'; // In reality, we'd check payment logic
    await this.subscriptionRepo.save(subscription);

    return { success: true, message: 'Account reactivated successfully' };
  }

  @Post('cancel')
  async cancelAccount(@Req() req: any) {
    const tenantId = req.tenantId;
    if (!tenantId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    const subscription = await this.subscriptionRepo.findOne({
      where: { tenantId },
    });
    if (!subscription)
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);

    subscription.status = 'canceled';
    await this.subscriptionRepo.save(subscription);

    // Queue data export job
    await this.billingQueue.add('export_tenant_data', { tenantId });
    // Queue deletion reminder at 60 days
    await this.billingQueue.add(
      'deletion_reminders',
      { tenantId, daysLeft: 60 },
      { delay: 30 * 24 * 60 * 60 * 1000 },
    ); // Roughly 30 days from now

    return {
      success: true,
      message: 'Account canceled and data export initiated',
    };
  }

  @Delete('delete')
  async deleteAccount(@Req() req: any) {
    // Require super-admin here (in practice, protected by `@Roles('super-admin')`)
    const tenantId = req.tenantId;
    if (!tenantId)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    // Stub for hard deletion
    await this.subscriptionRepo.delete({ tenantId });
    // This would cascade or trigger hard deletion of the tenant's schema/DB

    return { success: true, message: 'Account permanently deleted' };
  }
}
