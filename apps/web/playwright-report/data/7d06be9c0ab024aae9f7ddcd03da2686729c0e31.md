# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\sales-order-flow.spec.ts >> Sales order to invoice (API E2E) >> full revenue flow with Mushak 6.3
- Location: e2e\api\sales-order-flow.spec.ts:44:3

# Error details

```
Error: Create account failed (403): {"statusCode":403,"timestamp":"2026-05-31T11:45:38.362Z","path":"/api/v1/sales/accounts","method":"POST","correlationId":"N/A","message":"You do not have access to this tenant."}
```

# Test source

```ts
  1  | import type { APIRequestContext } from "@playwright/test";
  2  |
  3  | /** Default tenant from AutoSeedService (see apps/api/src/database/seeds/auto-seed.service.ts). */
  4  | export const DEFAULT_TENANT_ID =
  5  |   process.env.E2E_TENANT_ID ?? "d3b07384-d113-4c4e-9c8e-cf00257e8412";
  6  |
  7  | export const API_ORIGIN = process.env.E2E_API_ORIGIN ?? "http://localhost:3001";
  8  |
  9  | export const API_BASE_URL = process.env.E2E_API_URL ?? `${API_ORIGIN}/api/v1`;
  10 |
  11 | /** Health endpoint (no /v1 prefix). */
  12 | export const API_HEALTH_URL =
  13 |   process.env.E2E_API_HEALTH_URL ?? `${API_ORIGIN}/api/health`;
  14 |
  15 | export const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL ?? "admin@nurox.app";
  16 |
  17 | export const E2E_USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? "password123";
  18 |
  19 | export interface LoginResult {
  20 |   accessToken: string;
  21 |   user: { id: string; email: string };
  22 | }
  23 |
  24 | export async function login(request: APIRequestContext): Promise<LoginResult> {
  25 |   const response = await request.post(`${API_BASE_URL}/auth/login`, {
  26 |     headers: {
  27 |       "Content-Type": "application/json",
  28 |       "x-tenant-id": DEFAULT_TENANT_ID,
  29 |     },
  30 |     data: {
  31 |       email: E2E_USER_EMAIL,
  32 |       password: E2E_USER_PASSWORD,
  33 |     },
  34 |   });
  35 |
  36 |   if (!response.ok()) {
  37 |     const body = await response.text();
  38 |     throw new Error(
  39 |       `Login failed (${response.status()}): ${body}. Is the API running? Try: pnpm docker:up`,
  40 |     );
  41 |   }
  42 |
  43 |   const json = (await response.json()) as {
  44 |     data?: {
  45 |       user: { id: string; email: string };
  46 |       tokens: { accessToken: string };
  47 |     };
  48 |     user?: { id: string; email: string };
  49 |     tokens?: { accessToken: string };
  50 |   };
  51 |
  52 |   const payload = json.data ?? json;
  53 |
  54 |   return {
  55 |     accessToken: payload.tokens!.accessToken,
  56 |     user: payload.user!,
  57 |   };
  58 | }
  59 |
  60 | export function authedHeaders(accessToken: string): Record<string, string> {
  61 |   return {
  62 |     "Content-Type": "application/json",
  63 |     Authorization: `Bearer ${accessToken}`,
  64 |     "x-tenant-id": DEFAULT_TENANT_ID,
  65 |   };
  66 | }
  67 |
  68 | export async function expectOk(
  69 |   response: Awaited<ReturnType<APIRequestContext["post"]>>,
  70 |   label: string,
  71 | ) {
  72 |   if (!response.ok()) {
  73 |     const body = await response.text();
> 74 |     throw new Error(`${label} failed (${response.status()}): ${body}`);
     |           ^ Error: Create account failed (403): {"statusCode":403,"timestamp":"2026-05-31T11:45:38.362Z","path":"/api/v1/sales/accounts","method":"POST","correlationId":"N/A","message":"You do not have access to this tenant."}
  75 |   }
  76 | }
  77 |
```
