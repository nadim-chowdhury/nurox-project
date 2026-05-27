import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSubscription } from '../../modules/billing/entities/tenant-subscription.entity';
import {
  REQUIRE_PLAN_FEATURE_KEY,
  PlanFeatureLimit,
} from '../decorators/plan-feature.decorator';

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(TenantSubscription)
    private subscriptionRepo: Repository<TenantSubscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeatureData = this.reflector.getAllAndOverride<{
      feature: PlanFeatureLimit;
      requiredModule?: string;
    }>(REQUIRE_PLAN_FEATURE_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredFeatureData) {
      return true; // No limit required
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId; // Set by TenantMiddleware

    if (!tenantId) {
      return true; // System routes bypass tenant limits
    }

    const subscription = await this.subscriptionRepo.findOne({
      where: { tenantId },
      relations: ['plan'],
    });

    if (!subscription || !subscription.plan) {
      throw new HttpException(
        'No active subscription found for tenant.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (
      subscription.status !== 'active' &&
      subscription.status !== 'trialing'
    ) {
      throw new HttpException(
        'Subscription is inactive or past due.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const { feature, requiredModule } = requiredFeatureData;
    const planFeatures = subscription.plan.features;

    if (feature === 'modules' && requiredModule) {
      if (!planFeatures.modules?.includes(requiredModule)) {
        throw new HttpException(
          `Your plan does not include access to the ${requiredModule} module. Please upgrade.`,
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
    }

    // For user limits and storage, the actual count check should happen in the service layer where we count rows,
    // but the guard ensures the subscription is active. We can also add standard counts here if we inject other repos.
    // For now, this validates basic plan access.

    return true;
  }
}
