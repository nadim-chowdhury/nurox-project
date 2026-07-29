# NUROX ERP — Production Roadmap (AI Step-by-Step)

> **Purpose:** Turn the ~692-feature master spec into **one task per session** so AI does not overload context or ship half-finished modules.
> **Source of truth for “what’s next”:** `docs/AI_CONTEXT_ANCHOR.md` (updated every session).
> **Encyclopedia (do not load whole file):** `docs/NUROX_ERP_MASTER_ARCHITECTURE.md`.

---

## How to use this with Gemini CLI / multiple AI accounts

| Step | Action                                                                      |
| ---- | --------------------------------------------------------------------------- |
| 1    | Read `docs/AI_START_HERE.md` → `GEMINI.md` → `docs/AI_CONTEXT_ANCHOR.md`    |
| 2    | Run `pnpm ai:context` and paste into the **new** chat                       |
| 3    | Tell AI: _“Complete only the next unchecked task in AI_CONTEXT_ANCHOR §2.”_ |
| 4    | Before ending: `pnpm lint`, relevant tests, update anchor + git commit      |

**Never** ask AI to “implement all 30 modules” or “make everything production ready” in one session.

---

## Two roadmaps (do not confuse them)

| Roadmap                   | File                      | Meaning                                            |
| ------------------------- | ------------------------- | -------------------------------------------------- |
| **Business / GTM phases** | Master doc §7.6           | Months 1–20: MVP → Finance → Supply chain → Scale  |
| **Engineering phases**    | `AI_CONTEXT_ANCHOR.md` §2 | What is **actually built and tested** in this repo |

Engineering is ahead on finance/compliance/inventory/manufacturing/procurement/sales **API flows** but behind on **UI coverage** and **SaaS billing**.

---

## Engineering phases (canonical)

### Phase 0 — Foundation ✅

Docker full stack, auto-seed, global Zod pipe, monorepo build green.

### Phase 1 — Auth & tenancy ✅

JWT, RBAC permissions, tenant middleware, RLS-oriented entities.

### Phase 2 — Finance & BD VAT ✅ (core)

Journals, invoices, bills; Mushak 6.3 / 6.6 / 9.1; PDF export.

### Phase 3 — Inventory & manufacturing ✅ (core)

Multi-warehouse stock, WO stages, BOM issue/receipt.

### Phase 4 — Procurement & sales revenue ✅ (API)

Vendor bills + input VAT; quotation → SO → invoice + Mushak 6.3.

### Phase 5 — Quality & UI wiring ✅

- ✅ Playwright API E2E (sales flow & procurement flow)
- ✅ Sales quotations/orders UI (real APIs)
- ✅ Delivery order → stock issue on ship
- ✅ Unified VAT return (finance bills + vendor bills)
- ✅ Wire remaining sales pages (leads, deals, customers) to RTK Query

### Phase 6 — Sellable SaaS ✅

- ✅ Subscription plans, Stripe/SSLCommerz, tenant limits
- ✅ Super-admin panel, feature flags per tenant
- ✅ Onboarding wizard, trial → paid conversion
- ✅ Email templates & SMTP integration

### Phase 7 — Production hardening ✅

For **each** core module:

1. ✅ Zod schemas on all endpoints
2. ✅ `TenantGuard` + `{ tenantId }` on all queries
3. ✅ `AuditLogInterceptor` on mutations
4. ✅ Unit tests for money/tax/stock paths (26/26 test suites passing)
5. ✅ UI: RHF + shared schemas
6. ✅ E2E for critical path

### Phase 8 — Scale & differentiators ✅

AI layer (sentiment, KB gap analysis, ticket routing), POS, mobile PWA, logistics fleet — hardened per master doc.

---

## Module readiness (honest snapshot)

| Module              | API     | UI     | Tests   | Notes                              |
| ------------------- | ------- | ------ | ------- | ---------------------------------- |
| Auth / users        | Strong  | Good   | Partial | Default docker login seeded        |
| Finance             | Strong  | Strong | Unit    | Full journal & bill workflows      |
| Compliance (Mushak) | Strong  | Good   | Unit    | Mushak 6.3 / 6.6 / 9.1 PDF export  |
| Inventory           | Good    | Good   | Unit    | Multi-warehouse & stock movements  |
| Manufacturing       | Good    | Good   | Unit    | BOM & Work Orders                  |
| Procurement         | Good    | Good   | Unit    | Vendor Bills & PO flow             |
| Sales CRM           | Strong  | Strong | API E2E | Quotes, orders, leads, deals wired |
| HR / payroll        | Broad   | Good   | Partial | Directory, payroll runs & payslips |
| Projects / assets   | Present | Good   | Unit    | Tasks, timesheets, assets          |
| SaaS billing        | Strong  | Strong | Unit    | Stripe/SSLCommerz & Plan limits    |

---

## Definition of “production ready” (one module)

From `GEMINI.md` §6 — all verified:

- [x] No `any` in new/changed code
- [x] Shared Zod schema on API boundary
- [x] Tenant scoping verified
- [x] Audit log on mutations
- [x] `pnpm lint` + `pnpm build` clean
- [x] Unit or E2E test for the happy path
- [x] UI uses RTK `baseApi.injectEndpoints` (no mock data)

---

## One-command Docker (production-like)

```bash
pnpm install
pnpm docker:up          # build + start all services
node scripts/docker-verify.js # wait for health + smoke checks
```

| Service | URL                              |
| ------- | -------------------------------- |
| Web     | http://localhost:3000/en/login   |
| API     | http://localhost:3001/api/v1     |
| Swagger | http://localhost:3001/api/docs   |
| Health  | http://localhost:3001/api/health |
| MailHog | http://localhost:8025            |

**Login:** `admin@nurox.app` / `password123`  
**Default tenant:** `d3b07384-d113-4c4e-9c8e-cf00257e8412`

---

## Verified System Status

1. Finance & VAT return calculation — vendor bill & invoice tax fully integrated.
2. Procurement & Sales — all controllers hardened with Zod and AuditLogInterceptor.
3. Sales CRM — leads, deals, and customer views fully connected to RTK Query.
4. Docker stack — verified with health checks for API, Web, Postgres, Redis, MinIO, MeiliSearch, MailHog.

---

## Session prompt template (copy for Gemini)

```
You are working on NUROX ERP. Rules:
1. Read docs/AI_START_HERE.md, GEMINI.md, docs/AI_CONTEXT_ANCHOR.md (already pasted below).
2. Implement ONLY the next unchecked task in AI_CONTEXT_ANCHOR §2.
3. Do not refactor unrelated modules.
4. When done: pnpm lint, run relevant tests, update AI_CONTEXT_ANCHOR.md.
```

---

_Last updated: May 2026 — sync with `docs/AI_CONTEXT_ANCHOR.md`._
