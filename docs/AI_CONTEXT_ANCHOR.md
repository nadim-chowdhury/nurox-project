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
  - [x] ESM syntax error in `gdpr.controller.ts` (archiver import) — **Resolved**.
  - [x] Missing `GradeRepository` in `HrService` — **Verified & Resolved**.
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

### Phase 2: Financial Core (NEXT)

- [ ] **Task 2.1: Finance Module Hardening.** Implement Chart of Accounts (Tree structure), General Ledger, and Journal Entries with strict tenant scoping.
- [ ] **Task 2.2: Automated Tax/VAT Logic.** Implement BD-specific tax rules (VAT 2012 Act) with 100% unit test coverage using strategies.

---

## 3. Session Check-out Protocol (Mandatory for AI)

Before ending a session, the AI must:

1.  **Validate:** Run `pnpm lint` and critical tests.
2.  **Anchor Update:** Edit this file (`docs/AI_CONTEXT_ANCHOR.md`) with:
    - [x] Completed tasks.
    - [ ] New tasks or discovered blockers.
3.  **Propose Next Step:** State clearly what the next session should focus on.

---

## 4. Work Summary (May 29, 2026)

### Latest Completion (Phase 1)

- **RBAC Expansion:** Added 50+ new permission nodes covering the full scope of the ERP (from POS to Manufacturing).
- **Entity Consolidation:** Refactored `Tenant`, `Invoice`, `TenantSubscription`, `TenantCustomDomain`, and `TenantModule` to follow strict inheritance patterns. This eliminates redundancy and ensures uniform column naming (`tenant_id`, `created_at`, `updated_at`).
- **Security Audit:** Verified that `TenantSubscriber` and `TenantConnectionService` provide a strong second layer of defense for multi-tenancy beyond simple middleware.

### Discovered Issues

- Some entities were found to be placeholders (`Sale`, `Inventory`). These will be implemented as we reach their respective phases.
- `Tenant` entity had redundant timestamp decorators that conflicted with `BaseEntity`. (Fixed)

---

## 5. Instructions for Next Session

1.  Read `GEMINI.md` and this file.
2.  **Phase 2 — Task 2.1:** Begin implementing the **Chart of Accounts** in `apps/api/src/modules/finance/`. This requires a tree structure (Parent/Child accounts) and must enforce tenant isolation at every level.
3.  **Phase 2 — Task 2.2:** Research the **Bangladesh VAT Act 2012** to prepare the strategy for automated tax calculation in the `compliance` module.
