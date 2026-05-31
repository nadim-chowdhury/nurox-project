# NUROX ERP — AI Context Anchor (State Machine)

> **Role:** Long-term memory for AI-driven development across multiple accounts/sessions.
> **Mandate:** AI MUST read this file before writing code and update it after completing a task.
> **Sync:** `pnpm ai:context` copies this + `GEMINI.md` to clipboard for instant session recovery.

---

## 1. Project Health & Production Readiness

| Check                  | Status  | Notes                                                                  |
| ---------------------- | ------- | ---------------------------------------------------------------------- |
| **Multi-Tenancy**      | ✅ Done | Middleware, RLS, and TenantBaseEntity verified in Core/Finance modules |
| **Shared Schemas**     | ✅ Done | Zod schemas in `packages/shared-schemas` used in API & Web             |
| **Audit Logs**         | ✅ Done | Global `AuditLogInterceptor` captures all mutations                    |
| **Form Consistency**   | 🟡 WIP  | Refactored `Invoices` to RHF; other modules need audit                 |
| **One-Command Run**    | ✅ Done | `pnpm docker:up` builds and seeds entire stack                         |
| **Session Continuity** | ✅ Done | `pnpm ai:context` protocol established in `GEMINI.md`                  |

---

## 2. Active Roadmap Progress

**Current Phase:** Phase 7 — Advanced Features & Search

- [x] 5.1 Multi-tenant Chart of Accounts (COA) templates
- [x] 5.2 Dynamic Journal Posting for Invoice Payments
- [x] 5.3 PDF Invoice Generation (Puppeteer)
- [x] 5.4 Delivery order fulfillment + stock issue on ship
- [x] 5.5 Bank Statement Reconciliation (Matching Logic)
- [x] 6.1 Automated Payroll Calculation Engine
- [x] 6.2 One-click Payroll Generation with Audit Logs
- [x] 6.3 Automated Compliance (Mushak 6.3/6.6) Generation
- [x] 7.1 Multi-tenant Search with MeiliSearch (Global Search)
- [x] 7.2 AI-Powered Search Re-ranking (Hybrid Search + Analytics)

---

## 3. Latest Architecture Improvements (May 2026)

- **AI Hybrid Search:** Implemented `SearchModule` with MeiliSearch and OpenAI embeddings (`text-embedding-3-small`). Search uses a hybrid 50/50 semantic-to-keyword ratio with multi-tenant isolation.
- **Search Analytics:** Added `SearchQuery` tracking for popular queries and click-through rates (CTR) via a dedicated `/search/click` endpoint.
- **Global Search:** Added a Command Palette (⌘K) in the frontend for unified cross-module entity discovery.
- **Backend Fulfillment:** `SalesOrderFlowService` orchestrates the end-to-end fulfillment process...

---

## 4. Pending Bug Fixes / Debt

- [ ] Audit all frontend modules for direct Antd Form usage; refactor to RHF.
- [ ] Replace remaining `any` in `FinanceService`, `SalesService`, and `PayrollService` with proper Zod-inferred types.
- [ ] Add Playwright E2E test for the new `Invoice`, `DeliveryOrder`, `Payroll`, and `Compliance` flows.

---

## 5. Session Recovery Context

**LAST ACTION:**
Implemented Task 7.2: AI-Powered Search Re-ranking. Integrated OpenAI embeddings for hybrid search in MeiliSearch. Added `SearchQuery` analytics for tracking popular queries and result clicks.

**NEXT TASK:**
**Task 8.1: Real-time Collaborative Editing (Operational Transformation).**
This begins Phase 8 (Real-time Collaboration).
This requires:

1.  Implementing a WebSocket-based synchronization layer for shared documents and spreadsheets. 2. Using Yjs or Automerge for conflict-free replicated data types (CRDTs). 3. Adding "Presence" indicators (who is currently viewing/editing).

---

## 6. Critical File Index

| File                                    | Purpose                                    |
| --------------------------------------- | ------------------------------------------ |
| `GEMINI.md`                             | Foundational mandates (READ FIRST)         |
| `docs/AI_START_HERE.md`                 | Session bootstrap & URLs                   |
| `docs/PRODUCTION_ROADMAP.md`            | Sellable-SaaS phases + module readiness    |
| `docs/NUROX_ERP_MASTER_ARCHITECTURE.md` | Deep reference only — do not load entirely |
| `README.md`                             | Docker quick start, scripts                |
