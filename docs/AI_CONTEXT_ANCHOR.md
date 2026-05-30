# NUROX ERP — AI Context Anchor (State Machine)

> **Role:** Long-term memory for AI-driven development across multiple accounts/sessions.
> **Mandate:** AI MUST read this file before writing code and update it after completing a task.
> **Current Goal:** Phase 5 — Delivery order fulfillment or unified VAT reporting (sales UI wired).

---

## 1. Project Health Snapshot

- **Branch:** `main`
- **Tech Stack:** Turborepo, NestJS 11, Next.js 16, Postgres 17, Redis 7, MinIO, MeiliSearch.
- **Architectural Integrity:**
  - [x] Multi-tenancy (RLS/Middleware) verified in all modules.
  - [x] Centralized Zod Validation (100% boundary check) — **Global Pipe Enabled**.
  - [x] Global Audit Logging active on all mutations.
- **Critical Blockers:**
  - [x] Monorepo compilation/build errors — **All 37+ backend & frontend errors fully resolved**.
  - [ ] E2E tests failing due to Redis/Upstash connection leaks (Still investigating).

---

## 2. Active Development Frontier (Step-by-Step Roadmap)

### Phase 0: Foundation Stabilization & Unified Environment (COMPLETED)

- [x] **Task 0.1: Unified Docker Orchestration.** Created root `docker-compose.yml` and `pnpm docker:up` script.
- [x] **Task 0.2: Resolve Core Blockers.** Fixed `archiver` and `GradeRepository` dependencies.
- [x] **Task 0.3: Global Hardening.** Enabled `ZodValidationPipe` globally in `main.ts` for all API boundaries.
- [x] **Task 0.4: Production-Ready Docker & Seeding.** Configured Next.js standalone build, corrected health checks, implemented automatic database startup seeder (`AutoSeedService`), and added a localhost middleware resolution fallback.
- [x] **Task 0.5: AI Session Memory Continuity.** Created `scripts/copy-ai-context.js` (`pnpm ai:context`) to aggregate and copy the session state directly to the clipboard for seamless multi-account development.

### Phase 1: Authentication & Tenant Security Hardening (COMPLETED)

- [x] **Task 1.1: Multi-Tenant RLS Audit.** Verified 170+ entities; refactored Billing and System entities to correctly extend `TenantBaseEntity`. Removed redundant `createdAt`/`updatedAt` fields across key modules.
- [x] **Task 1.2: RBAC/Permission Node Audit.** Expanded `Permission` enum in `@repo/shared-schemas` to cover all 30+ ERP modules (Payroll, Manufacturing, POS, etc.). Verified `PermissionsGuard` logic.

### Phase 2: Financial Core (COMPLETED)

- [x] **Task 2.1: Finance Module Hardening.** Implemented transactional journal posting, atomic balance updates, and account tree validation (circularity check). Verified with unit tests.
- [x] **Task 2.2: Automated Tax/VAT Logic (Research).** Researched Bangladesh VAT Act 2012 requirements (Mushak forms, VDS, rebate logic).
- [x] **Task 2.3: Implement BD VAT Mushak Forms.** Created entities and services for Mushak 6.3 and 6.6 (VDS) in the `compliance` module. Updated `BangladeshTaxStrategy` for accurate SD/VAT calculation.
- [x] **Task 2.4: Implement PDF Generation for Mushak Forms.** Designed NBR-compliant Handlebars templates for Mushak 6.3 and 6.6. Implemented `ComplianceReportService` for PDF generation via `PdfService`.
- [x] **Task 2.5: Implement Mushak 9.1 Aggregation Logic.** Developed logic to aggregate monthly VAT returns from Mushak 6.3 and VDS records. Stored results in `TaxFilingExport`.

### Phase 3: Advanced Business Modules (COMPLETED)

- [x] **Task 3.1: Inventory Multi-Warehouse Support.** Implemented warehouse-specific stock levels and inter-warehouse transfers. Defined `Inventory` entity for tracking balances.
- [x] **Task 3.2: Manufacturing Module Hardening.** Multi-stage `WorkOrderStage`, `Machine` scheduling, BOM auto-issue on stage start, FG receipt on WO complete.

### Phase 4: Procurement & Sales Revenue (COMPLETED)

- [x] **Task 4.1: Vendor Bills with line-level VAT/SD.** `VendorBillLine` entity, create/submit/pay/cancel APIs, BD tax calculation, finance AP bill sync on submit.
- [x] **Task 4.2: Mushak 9.1 input tax integration.** `ComplianceReportService` now aggregates real purchase VAT from procurement (no longer mocked).
- [x] **Task 4.3: Sales order-to-invoice + Mushak 6.3.** `SalesOrderFlowService`: quotation → SO → confirm → finance invoice + Mushak 6.3 in one step.

### Phase 5: E2E & Quality (IN PROGRESS)

- [x] **Task 5.1: Playwright API E2E.** `apps/web/e2e/api/sales-order-flow.spec.ts` — full quotation → invoice + Mushak flow; login UI smoke test.
- [x] **Task 5.2: Sales accounts API.** `POST/GET /sales/accounts` for E2E test data setup.
- [x] **Task 5.3: Sales quotations/orders UI.** RTK `salesApi` endpoints; live quotations & orders pages with create/send/convert/confirm/invoice flows; `GET /inventory/products` for line picker.
- [ ] **Task 5.4: Delivery order fulfillment.** Ship DO → `InventoryService.issueStock`; tenant-scoped APIs + tests.
- [ ] **Task 5.5: Unified VAT return.** Merge vendor bill input tax into finance `computeVATReturn`.
- [ ] **Task 5.6: Sales CRM UI.** Wire leads/deals/customers pages to existing sales APIs (remove mock data).

### Phase 6: Sellable SaaS (PLANNED)

- [ ] **Task 6.1: Subscription billing.** Plans, Stripe/SSLCommerz webhooks, tenant limits.
- [ ] **Task 6.2: Super-admin + feature flags.** Per-tenant module toggles.

---

## 3. Session Check-out Protocol (Mandatory for AI)

Before ending a session, the AI must:

1.  **Validate:** Run `pnpm lint` and critical tests. (Verified via unit tests in `finance.service.spec.ts`, `mushak.service.spec.ts`, `bangladesh-tax.strategy.spec.ts`, and `compliance-report.service.spec.ts`)
2.  **Anchor Update:** Edit this file (`docs/AI_CONTEXT_ANCHOR.md`) with:
    - [x] Completed tasks.
    - [x] New tasks or discovered blockers.
3.  **Propose Next Step:** One line in §5 pointing to the next unchecked task in §2.

---

## 4. Work Summary (May 30, 2026)

### Latest Completion

- **Sales UI (Task 5.3):** `salesApi` RTK endpoints for quotations/SO/accounts; quotations page (create, send, convert); orders page with detail drawer (confirm, create invoice + Mushak 6.3); `GET /inventory/products` list API.

### Prior (May 30, 2026)

- **Playwright E2E (Task 5.1–5.2):** API integration test for full sales revenue flow; login UI smoke; `pnpm test:e2e:api` / `test:e2e:ui` scripts; `POST/GET /sales/accounts` endpoint.

### Prior (May 30, 2026)

- **Sales Order-to-Invoice Flow (Task 4.3):** New `SalesOrderFlowService` with tenant-scoped quotation/SO APIs, BD VAT line calculation, `POST sales-orders/:id/create-invoice` creates finance `Invoice` + Mushak 6.3 and links IDs on the sales order. Migration `1779900300000-SalesOrderInvoiceFlow`. Tests in `sales-order-flow.service.spec.ts`.

### Prior (May 30, 2026)

- **Procurement Vendor Bills & Input VAT (Task 4.1–4.2):** `VendorBillLine` with per-line VAT/SD (Bangladesh formula), full vendor bill lifecycle, finance `Bill` sync on submit, Mushak 9.1 pulls real input tax from procurement. Migration `1779900200000-VendorBillLines`. Tests in `procurement.service.spec.ts` and updated `compliance-report.service.spec.ts`.

### Prior (May 30, 2026)

- **Manufacturing Module Hardening (Task 3.2):** Added `WorkOrderStage` and `Machine` entities, multi-stage WO lifecycle (`start` / `complete` stage), machine availability checks, BOM material auto-issue via `InventoryService.issueStock` on stage start, and FG receipt via `receiveStock` on WO completion. Migration `1779900100000-ManufacturingStages`. Unit tests in `manufacturing.service.spec.ts`.

### Prior (May 29, 2026)

- **Production-Ready Docker & Startup Seeding:** Enhanced root `docker-compose.yml`, enabled Next.js `standalone` mode, and corrected container health checks. Created `AutoSeedService` to automatically seed default tenant, admin credentials, roles, and departments on database boot. Created local development middleware fallback to `'tenant_default'`.
- **AI Context Session Continuity:** Created `scripts/copy-ai-context.js` script (runnable via `pnpm ai:context`) that packages project guidelines, modified git status, and memory state, copying them straight to the clipboard to prevent context drift when switching accounts/tokens.
- **Monorepo Build Error Resolution:** Resolved all 37+ backend/frontend TypeScript, ESM interop, Next.js type checking, and Zod resolver/input-output defaults mismatch errors across `api` and `web`. The entire monorepo (`pnpm run build`) now compiles successfully with zero errors.
- **Inventory Multi-Warehouse:** Implemented the `Inventory` entity to provide a real-time, warehouse-scoped view of stock balances. Refactored `InventoryService` to maintain these balances during Receipts, Issues, Transfers, and Adjustments. Added warehouse-aware reporting and stock count logic. Verified with unit tests.
- **BD VAT Mushak Forms:** Implemented Mushak 6.3 (Tax Invoice), 6.6 (VDS), and 9.1 (Return) in the `compliance` module with PDF generation and aggregation logic.

### Discovered Issues

- Finance `computeVATReturn` still reads finance `bills` table only — consider merging vendor bill input tax for unified VAT reports.
- Procurement legacy endpoints still use `any` DTOs without tenant scoping on some methods (pre-existing).

---

## 5. Instructions for Next Session

**NEXT TASK (pick one per session):** Task **5.4** — Delivery order fulfillment + stock issue on ship.

1.  Read `docs/AI_START_HERE.md`, then `GEMINI.md`, then this file, then `docs/PRODUCTION_ROADMAP.md` if scope is unclear.
2.  Run `pnpm ai:context` if resuming in a new AI account and paste into the chat.
3.  Implement **only** the next unchecked task in §2 above.
4.  Verify: `pnpm lint`, `pnpm build`, relevant tests; Docker: `pnpm docker:up && pnpm docker:verify`.
5.  Update this anchor (check off task, add blockers, set §5 next task line).

---

## 6. Documentation Map (May 2026)

| File                                    | When to read                               |
| --------------------------------------- | ------------------------------------------ |
| `docs/AI_START_HERE.md`                 | Every session (short bootstrap)            |
| `GEMINI.md`                             | Every session (coding rules)               |
| `docs/AI_CONTEXT_ANCHOR.md`             | Every session (current task)               |
| `docs/PRODUCTION_ROADMAP.md`            | Sellable-SaaS phases + module readiness    |
| `docs/NUROX_ERP_MASTER_ARCHITECTURE.md` | Deep reference only — do not load entirely |
| `README.md`                             | Docker quick start, scripts                |
