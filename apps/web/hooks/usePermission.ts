import { useAppSelector } from "./useRedux";
import type { AuthUser } from "@/store/slices/authSlice";

type UserRole = AuthUser["role"];

/**
 * Permission check hook.
 * Reads the current user's role from Redux auth state
 * and provides helpers for role-based access control.
 *
 * @example
 * const { hasRole, isAdmin, canAccess } = usePermission();
 * if (!canAccess(["ADMIN", "HR_MANAGER"])) return <Forbidden />;
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
  };
}
