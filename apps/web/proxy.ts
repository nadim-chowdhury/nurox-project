import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

/**
 * next-intl configuration
 */
const locales = ["en", "bn", "ar"];
const defaultLocale = "en";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // or 'as-needed'
});

/**
 * Edge middleware for route protection and multi-tenancy.
 */

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
const REFRESH_COOKIE = "nurox_refresh_token";

export default function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;
  const hostname = request.headers.get("host") || "";

  // 1. Multi-Tenancy Subdomain Extraction (e.g., acme.nurox.app -> acme)
  let tenantId = "public";
  if (
    hostname.includes(".nurox.app") ||
    (hostname.includes("localhost") && hostname.split(".").length > 1)
  ) {
    tenantId = hostname.split(".")[0] || "public";
  }

  // 2. Localization Middleware
  const response = intlMiddleware(request);

  // 3. Inject Tenant ID into headers for subsequent use
  response.headers.set("x-tenant-id", tenantId);

  // 4. Authentication logic
  const pathnameWithoutLocale = locales.reduce(
    (acc, locale) => acc.replace(`/${locale}`, "") || "/",
    pathname,
  );

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(route + "/"),
  );

  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  if (isPublicRoute || isStaticFile) {
    return response;
  }

  // Check for refresh token cookie
  const hasRefreshToken = request.cookies.has(REFRESH_COOKIE);

  if (!hasRefreshToken) {
    const loginUrl = new URL(`/${defaultLocale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /static (inside /public)
    // - all root files (e.g. /favicon.ico)
    "/((?!api|_next|.*\\..*).*)",
  ],
};
