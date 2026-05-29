# NUROX ERP — AI Context Anchor (State Machine)

> **Role:** Long-term memory for AI-driven development across multiple accounts/sessions.
> **Mandate:** AI MUST read this file before writing code and update it after completing a task.
> **Current Goal:** Hardening Foundational Infrastructure & Unified Docker Setup.

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

### Phase 1: Authentication & Tenant Security Hardening (COMPLETED)

- [x] **Task 1.1: Multi-Tenant RLS Audit.** Verified 170+ entities; refactored Billing and System entities to correctly extend `TenantBaseEntity`. Removed redundant `createdAt`/`updatedAt` fields across key modules.
- [x] **Task 1.2: RBAC/Permission Node Audit.** Expanded `Permission` enum in `@repo/shared-schemas` to cover all 30+ ERP modules (Payroll, Manufacturing, POS, etc.). Verified `PermissionsGuard` logic.

### Phase 2: Financial Core (IN PROGRESS)

- [x] **Task 2.1: Finance Module Hardening.** Implemented transactional journal posting, atomic balance updates, and account tree validation (circularity check). Verified with unit tests.
- [x] **Task 2.2: Automated Tax/VAT Logic (Research).** Researched Bangladesh VAT Act 2012 requirements (Mushak forms, VDS, rebate logic).
- [x] **Task 2.3: Implement BD VAT Mushak Forms.** Created entities and services for Mushak 6.3 and 6.6 (VDS) in the `compliance` module. Updated `BangladeshTaxStrategy` for accurate SD/VAT calculation.
- [x] **Task 2.4: Implement PDF Generation for Mushak Forms.** Designed NBR-compliant Handlebars templates for Mushak 6.3 and 6.6. Implemented `ComplianceReportService` for PDF generation via `PdfService`.
- [x] **Task 2.5: Implement Mushak 9.1 Aggregation Logic.** Developed logic to aggregate monthly VAT returns from Mushak 6.3 and VDS records. Stored results in `TaxFilingExport`.

### Phase 3: Advanced Business Modules (IN PROGRESS)

- [x] **Task 3.1: Inventory Multi-Warehouse Support.** Implemented warehouse-specific stock levels and inter-warehouse transfers. Defined `Inventory` entity for tracking balances.
- [ ] **Task 3.2: Manufacturing Module Hardening.** Implement multi-stage Work Orders and resource scheduling.

---

## 3. Session Check-out Protocol (Mandatory for AI)

Before ending a session, the AI must:

1.  **Validate:** Run `pnpm lint` and critical tests. (Verified via unit tests in `finance.service.spec.ts`, `mushak.service.spec.ts`, `bangladesh-tax.strategy.spec.ts`, and `compliance-report.service.spec.ts`)
2.  **Anchor Update:** Edit this file (`docs/AI_CONTEXT_ANCHOR.md`) with:
    - [x] Completed tasks.
    - [x] New tasks or discovered blockers.
3.  **Propose Next Step:** Transition to Phase 3: Advanced Business Modules. Start with Task 3.1 (Inventory Multi-Warehouse).

---

## 4. Work Summary (May 29, 2026)

### Latest Completion

- **Monorepo Build Error Resolution:** Resolved all 37+ backend/frontend TypeScript, ESM interop, Next.js type checking, and Zod resolver/input-output defaults mismatch errors across `api` and `web`. The entire monorepo (`pnpm run build`) now compiles successfully with zero errors.
- **Inventory Multi-Warehouse:** Implemented the `Inventory` entity to provide a real-time, warehouse-scoped view of stock balances. Refactored `InventoryService` to maintain these balances during Receipts, Issues, Transfers, and Adjustments. Added warehouse-aware reporting and stock count logic. Verified with unit tests.
- **BD VAT Mushak Forms:** Implemented Mushak 6.3 (Tax Invoice), 6.6 (VDS), and 9.1 (Return) in the `compliance` module with PDF generation and aggregation logic.

### Discovered Issues

- Input Tax (Purchases) aggregation is currently mocked. Full implementation requires linking with the Procurement module's Vendor Bill lines once they are implemented.

---

## 5. Instructions for Next Session

1.  Read `GEMINI.md` and this file.
2.  **Phase 3 — Task 3.2:** Begin **Manufacturing Module Hardening**. Implement multi-stage Work Orders by adding a `WorkOrderStage` entity.
3.  Implement resource scheduling (Work Centers and Machines) for each stage of the work order.
4.  Ensure stock is automatically issued (consumed) from the Inventory module when a manufacturing stage starts, based on the Bill of Materials (BOM).
