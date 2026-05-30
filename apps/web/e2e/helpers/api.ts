import type { APIRequestContext } from "@playwright/test";

/** Default tenant from AutoSeedService (see apps/api/src/database/seeds/auto-seed.service.ts). */
export const DEFAULT_TENANT_ID =
  process.env.E2E_TENANT_ID ?? "d3b07384-d113-4c4e-9c8e-cf00257e8412";

export const API_ORIGIN = process.env.E2E_API_ORIGIN ?? "http://localhost:3001";

export const API_BASE_URL = process.env.E2E_API_URL ?? `${API_ORIGIN}/api/v1`;

/** Health endpoint (no /v1 prefix). */
export const API_HEALTH_URL =
  process.env.E2E_API_HEALTH_URL ?? `${API_ORIGIN}/api/health`;

export const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL ?? "admin@nurox.app";

export const E2E_USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? "password123";

export interface LoginResult {
  accessToken: string;
  user: { id: string; email: string };
}

export async function login(request: APIRequestContext): Promise<LoginResult> {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": DEFAULT_TENANT_ID,
    },
    data: {
      email: E2E_USER_EMAIL,
      password: E2E_USER_PASSWORD,
    },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(
      `Login failed (${response.status()}): ${body}. Is the API running? Try: pnpm docker:up`,
    );
  }

  const json = (await response.json()) as {
    user: { id: string; email: string };
    tokens: { accessToken: string };
  };

  return {
    accessToken: json.tokens.accessToken,
    user: json.user,
  };
}

export function authedHeaders(accessToken: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "x-tenant-id": DEFAULT_TENANT_ID,
  };
}

export async function expectOk(
  response: Awaited<ReturnType<APIRequestContext["post"]>>,
  label: string,
) {
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`${label} failed (${response.status()}): ${body}`);
  }
}
