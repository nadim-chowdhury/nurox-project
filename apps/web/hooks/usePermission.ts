import { useAppSelector } from "./useRedux";
import type { AuthUser } from "@/store/slices/authSlice";
import { Permission, RolePermissions } from "@repo/shared-schemas";

type UserRole = AuthUser["role"];
type ExtendedAuthUser = AuthUser & { permissions?: Permission[] };

/**
 * Permission check hook.
 * Reads the current user's role from Redux auth state
 * and provides helpers for role-based access control.
 *
 * @example
 * const { hasRole, isAdmin, canAccess, canPerform, Permission } = usePermission();
 * if (!canPerform(Permission.HR_VIEW_EMPLOYEES)) return <Forbidden />;
 */
export function usePermission() {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;

  return {
    /** Current user role */
    role,

    /** Check if user has a specific role */
    hasRole: (targetRole: UserRole): boolean => role === targetRole,

    /** Check if user has one of the allowed roles */
    canAccess: (allowedRoles: UserRole[]): boolean =>
      role ? allowedRoles.includes(role) : false,

    /** Convenience: is ADMIN */
    isAdmin: role === "ADMIN",

    /** Convenience: is authenticated */
    isAuthenticated: !!user,

    /** Check if user can perform a specific action */
    canPerform: (permission: Permission): boolean => {
      if (!user) return false;

      const extendedUser = user as ExtendedAuthUser;
      // Use permissions from user object if available (dynamic roles)
      if (extendedUser.permissions) {
        return extendedUser.permissions.includes(permission);
      }

      // Fallback to hardcoded mapping
      if (!role) return false;
      const userPermissions = RolePermissions[role] || [];
      return userPermissions.includes(permission);
    },

    /** Permission constants for easy access */
    Permission,
  };
}
