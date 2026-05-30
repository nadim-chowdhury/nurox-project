# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\sales-order-flow.spec.ts >> Sales order to invoice (API E2E) >> full revenue flow with Mushak 6.3
- Location: e2e\api\sales-order-flow.spec.ts:44:3

# Error details

```
Error: Login failed (500): {"statusCode":500,"timestamp":"2026-05-30T10:24:54.978Z","path":"/api/v1/auth/login","method":"POST","correlationId":"N/A","message":"Internal server error"}. Is the API running? Try: pnpm docker:up
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
  9  | export const API_BASE_URL =
  10 |   process.env.E2E_API_URL ?? `${API_ORIGIN}/api/v1`;
  11 |
  12 | /** Health endpoint (no /v1 prefix). */
  13 | export const API_HEALTH_URL =
  14 |   process.env.E2E_API_HEALTH_URL ?? `${API_ORIGIN}/api/health`;
  15 |
  16 | export const E2E_USER_EMAIL =
  17 |   process.env.E2E_USER_EMAIL ?? "admin@nurox.app";
  18 |
  19 | export const E2E_USER_PASSWORD =
  20 |   process.env.E2E_USER_PASSWORD ?? "password123";
  21 |
  22 | export interface LoginResult {
  23 |   accessToken: string;
  24 |   user: { id: string; email: string };
  25 | }
  26 |
  27 | export async function login(request: APIRequestContext): Promise<LoginResult> {
  28 |   const response = await request.post(`${API_BASE_URL}/auth/login`, {
  29 |     headers: {
  30 |       "Content-Type": "application/json",
  31 |       "x-tenant-id": DEFAULT_TENANT_ID,
  32 |     },
  33 |     data: {
  34 |       email: E2E_USER_EMAIL,
  35 |       password: E2E_USER_PASSWORD,
  36 |     },
  37 |   });
  38 |
  39 |   if (!response.ok()) {
  40 |     const body = await response.text();
> 41 |     throw new Error(
     |           ^ Error: Login failed (500): {"statusCode":500,"timestamp":"2026-05-30T10:24:54.978Z","path":"/api/v1/auth/login","method":"POST","correlationId":"N/A","message":"Internal server error"}. Is the API running? Try: pnpm docker:up
  42 |       `Login failed (${response.status()}): ${body}. Is the API running? Try: pnpm docker:up`,
  43 |     );
  44 |   }
  45 |
  46 |   const json = (await response.json()) as {
  47 |     user: { id: string; email: string };
  48 |     tokens: { accessToken: string };
  49 |   };
  50 |
  51 |   return {
  52 |     accessToken: json.tokens.accessToken,
  53 |     user: json.user,
  54 |   };
  55 | }
  56 |
  57 | export function authedHeaders(accessToken: string): Record<string, string> {
  58 |   return {
  59 |     "Content-Type": "application/json",
  60 |     Authorization: `Bearer ${accessToken}`,
  61 |     "x-tenant-id": DEFAULT_TENANT_ID,
  62 |   };
  63 | }
  64 |
  65 | export async function expectOk(
  66 |   response: Awaited<ReturnType<APIRequestContext["post"]>>,
  67 |   label: string,
  68 | ) {
  69 |   if (!response.ok()) {
  70 |     const body = await response.text();
  71 |     throw new Error(`${label} failed (${response.status()}): ${body}`);
  72 |   }
  73 | }
  74 |
```
