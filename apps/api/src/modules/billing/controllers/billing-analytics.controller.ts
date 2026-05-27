import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { TenantSubscription } from '../entities/tenant-subscription.entity';
// import { RolesGuard } from '../../../common/guards/roles.guard';
// import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('billing/analytics')
// @UseGuards(RolesGuard)
// @Roles('super-admin')
export class BillingAnalyticsController {
  constructor(
    @InjectRepository(TenantSubscription)
    private readonly subscriptionRepo: Repository<TenantSubscription>,
  ) {}

  @Get('mrr')
  async getMRR() {
    // 1. Fetch active/trialing subscriptions
    const subscriptions = await this.subscriptionRepo.find({
      where: { status: In(['active', 'trialing']) },
      relations: ['plan'],
    });

    let mrr = 0;
    let activeSubscribers = 0;
    let churnedSubscribers = await this.subscriptionRepo.count({
      where: { status: In(['canceled', 'suspended']) },
    });

    subscriptions.forEach((sub) => {
      activeSubscribers++;
      if (sub.plan && sub.status === 'active') {
        // Simple MRR calculation based on monthly price
        // If it's an annual plan, we could divide annualPrice by 12.
        // For simplicity, we just use the monthlyPrice value from the plan as the MRR component.
        mrr += Number(sub.plan.monthlyPrice) || 0;
      }
    });

    const arr = mrr * 12;
    const totalSubscribers = activeSubscribers + churnedSubscribers;
    const churnRate =
      totalSubscribers > 0 ? (churnedSubscribers / totalSubscribers) * 100 : 0;

    return {
      mrr: mrr.toFixed(2),
      arr: arr.toFixed(2),
      activeSubscribers,
      churnRate: churnRate.toFixed(2) + '%',
      newSubscriptions: activeSubscribers, // Mock for current period
    };
  }
}
