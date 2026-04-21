import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permissions.enum';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require granular permissions.
 * Overrides primitive Role-based access constraints.
 *
 * @example
 * @RequirePermissions(Permission.HR_CREATE_EMPLOYEE)
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
