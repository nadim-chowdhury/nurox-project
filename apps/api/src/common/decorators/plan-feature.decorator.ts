import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PLAN_FEATURE_KEY = 'requirePlanFeature';

export type PlanFeatureLimit =
  | 'maxUsers'
  | 'storageLimitGb'
  | 'apiRateLimit'
  | 'modules';

export const RequirePlanFeature = (
  feature: PlanFeatureLimit,
  requiredModule?: string,
) => SetMetadata(REQUIRE_PLAN_FEATURE_KEY, { feature, requiredModule });
