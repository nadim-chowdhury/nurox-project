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

### Phase 5 — Quality & UI wiring 🔄 (current)

- ✅ Playwright API E2E (sales flow)
- ✅ Sales quotations/orders UI (real APIs)
- ⬜ Delivery order → stock issue on ship
- ⬜ Unified VAT return (finance bills + vendor bills)
- ⬜ Playwright UI tests for sales pages
- ⬜ Wire remaining **mock** sales pages (leads, deals, customers)

### Phase 6 — Sellable SaaS (next major block)

- Subscription plans, Stripe/SSLCommerz, tenant limits
- Super-admin panel, feature flags per tenant
- Onboarding wizard, trial → paid conversion
- Email templates (production SMTP), not MailHog

### Phase 7 — Production hardening (ongoing per module)

For **each** module before marking “sellable”:

1. Zod schemas on all endpoints
2. `TenantGuard` + `{ tenantId }` on all queries
3. `AuditLogInterceptor` on mutations
4. Unit tests for money/tax/stock paths
5. UI: RHF + shared schemas (no mock tables)
6. E2E for critical path

### Phase 8 — Scale & differentiators (later)

AI layer, POS, mobile PWA, logistics fleet — per master doc modules 25–29.

---

## Module readiness (honest snapshot)

| Module              | API      | UI          | Tests   | Notes                                |
| ------------------- | -------- | ----------- | ------- | ------------------------------------ |
| Auth / users        | Strong   | Good        | Partial | Default docker login seeded          |
| Finance             | Strong   | Mixed       | Unit    | VAT return merge pending             |
| Compliance (Mushak) | Strong   | Partial     | Unit    | PDF generation exists                |
| Inventory           | Good     | Mixed       | Unit    | Product list API added               |
| Manufacturing       | Good     | Partial     | Unit    |                                      |
| Procurement         | Good     | Partial     | Unit    | Some legacy `any` endpoints          |
| Sales CRM           | Good     | **Partial** | API E2E | Quotes/orders live; leads/deals mock |
| HR / payroll        | Broad    | Mixed       | Partial | Large surface area                   |
| Projects / assets   | Present  | Mixed       | Low     |                                      |
| SaaS billing        | Scaffold | Low         | Low     | **Blocker for selling**              |

---

## Definition of “production ready” (one module)

From `GEMINI.md` §6 — all must pass:

- [ ] No `any` in new/changed code
- [ ] Shared Zod schema on API boundary
- [ ] Tenant scoping verified
- [ ] Audit log on mutations
- [ ] `pnpm lint` + `pnpm build` clean
- [ ] Unit or E2E test for the happy path
- [ ] UI uses RTK `baseApi.injectEndpoints` (no mock data)

---

## One-command Docker (production-like)

```bash
pnpm install
pnpm docker:up          # build + start all services
pnpm docker:verify      # wait for health + smoke checks
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

## Known gaps (fix in order)

1. Finance `computeVATReturn` — vendor bill input tax not merged
2. Procurement — legacy endpoints without full tenant/Zod hardening
3. Sales — leads/deals/customers pages still mock data
4. API Docker HEALTHCHECK — must hit `/api/health` (not `/api/v1/health`)
5. E2E — Redis connection cleanup under investigation
6. ~692 checklist items in master doc — **most are aspirational**; track via this file + anchor

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
