import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingController } from './controllers/billing.controller';
import { StripeService } from './services/stripe.service';
import { SslcommerzService } from './services/sslcommerz.service';
import { BillingCronService } from './services/billing-cron.service';
import { BillingProcessor } from './processors/billing.processor';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { TenantSubscription } from './entities/tenant-subscription.entity';
import { Invoice } from './entities/invoice.entity';
import { SystemModule } from '../system/system.module';
import { BullModule } from '@nestjs/bullmq';
import { MailerModule } from '../mailer/mailer.module';
import { InvoiceService } from './services/invoice.service';
import { BillingAnalyticsController } from './controllers/billing-analytics.controller';
import { LifecycleProcessor } from './processors/lifecycle.processor';
import { BkashService } from './services/bkash.service';
import { NagadService } from './services/nagad.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, TenantSubscription, Invoice]),
    ScheduleModule.forRoot(),
    BullModule.registerQueue({ name: 'billing' }),
    SystemModule,
    MailerModule,
  ],
  controllers: [BillingController, BillingAnalyticsController],
  providers: [
    StripeService,
    SslcommerzService,
    BkashService,
    NagadService,
    BillingCronService,
    BillingProcessor,
    InvoiceService,
    LifecycleProcessor,
  ],
  exports: [
    StripeService,
    SslcommerzService,
    BkashService,
    NagadService,
    InvoiceService,
  ],
})
export class BillingModule {}
