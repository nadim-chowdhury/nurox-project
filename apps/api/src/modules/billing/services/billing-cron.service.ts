import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { TenantSubscription } from '../entities/tenant-subscription.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BillingCronService {
  private readonly logger = new Logger(BillingCronService.name);

  constructor(
    @InjectRepository(TenantSubscription)
    private readonly subscriptionRepo: Repository<TenantSubscription>,
    @InjectQueue('billing')
    private readonly billingQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkTrialExpirations() {
    this.logger.log('Running daily trial expiration check...');
    const now = new Date();

    // Find subscriptions where trial ends today or earlier and status is still trialing
    const expiredTrials = await this.subscriptionRepo.find({
      where: {
        status: 'trialing',
        trialEndsAt: LessThanOrEqual(now),
      },
      relations: ['tenant'],
    });

    for (const sub of expiredTrials) {
      this.logger.log(
        `Trial expired for tenant ${sub.tenantId}. Updating status to past_due.`,
      );
      sub.status = 'past_due';
      await this.subscriptionRepo.save(sub);

      if (sub.tenant?.email) {
        await this.billingQueue.add('dunning_reminder', {
          email: sub.tenant.email,
          amount: 0,
          attempt: 1,
        });
      }
    }

    // Check for trials expiring in 7, 3, 1 days
    const daysToCheck = [7, 3, 1];
    for (const days of daysToCheck) {
      const targetDateStart = new Date();
      targetDateStart.setDate(targetDateStart.getDate() + days);
      targetDateStart.setHours(0, 0, 0, 0);

      const targetDateEnd = new Date(targetDateStart);
      targetDateEnd.setHours(23, 59, 59, 999);

      const expiringTrials = await this.subscriptionRepo.find({
        where: {
          status: 'trialing',
          trialEndsAt: Between(targetDateStart, targetDateEnd),
        },
        relations: ['tenant'],
      });

      for (const sub of expiringTrials) {
        if (sub.tenant?.email) {
          await this.billingQueue.add('trial_reminder', {
            email: sub.tenant.email,
            daysLeft: days,
          });
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDunningAndSuspensions() {
    this.logger.log('Running daily dunning checks...');
    // TODO: Identify unpaid invoices past due date, send reminders, and suspend accounts if grace period is over.
  }
}
