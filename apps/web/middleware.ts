import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware for route protection.
 *
 * Strategy:
 * - Check for the refresh token cookie (nurox_refresh_token)
 * - If missing → redirect to /login (user has no session at all)
 * - If present → allow through (JWT validation happens server-side)
 *
 * Why check the cookie instead of access token?
 * - Access token lives in Redux (client-side memory) — not available in middleware
 * - Refresh token cookie IS sent with every request
 * - If the cookie exists, the user had a session — the API will validate it
 * - If the cookie is expired/invalid, the API returns 401  → RTK Query handles refresh/logout
 */

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
const REFRESH_COOKIE = "nurox_refresh_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes, static files, and API routes
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for refresh token cookie
  const hasRefreshToken = request.cookies.has(REFRESH_COOKIE);

  if (!hasRefreshToken) {
    // No session → redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User has a session cookie → allow through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
