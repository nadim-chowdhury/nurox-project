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
  localePrefix: "always",
});

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
const REFRESH_COOKIE = "nurox_refresh_token";

export default function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;
  const hostname = request.headers.get("host") || "";

  // 1. Multi-Tenancy Resolution
  // Check for custom domains first, then fallback to subdomains
  // In a real app, you might query an API or cache for custom domain mapping
  let tenantId = "public";

  const baseDomain = "nurox.app";
  const isLocalhost = hostname.includes("localhost");

  if (isLocalhost) {
    const parts = hostname.split(".");
    if (parts.length > 1) {
      tenantId = parts[0];
    }
  } else if (hostname.endsWith(`.${baseDomain}`)) {
    tenantId = hostname.replace(`.${baseDomain}`, "");
  } else if (!hostname.includes(baseDomain)) {
    // Potential custom domain
    // tenantId = await resolveCustomDomain(hostname);
    tenantId = hostname; // For now, pass the full hostname as identifier
  }

  // Handle 'www' and other system subdomains
  if (["www", "app", "public"].includes(tenantId)) {
    tenantId = "public";
  }

  // 2. Localization Middleware
  const response = intlMiddleware(request);

  // 3. Inject Tenant ID into response headers and cookies
  // We set a cookie so the client-side API client can easily read it
  response.headers.set("x-tenant-id", tenantId);
  response.cookies.set("nurox_tenant_id", tenantId, {
    path: "/",
    httpOnly: false, // Accessible by client-side JS
    sameSite: "lax",
  });

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

  // Check for refresh token cookie (indicates logged in)
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
