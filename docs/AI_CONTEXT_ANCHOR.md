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

**Current Phase:** Phase 9 — Predictive Analytics & AI Forecasting

- [x] 7.2 AI-Powered Search Re-ranking (Hybrid Search + Analytics)
- [x] 8.1 Real-time Collaborative Editing (Operational Transformation)
- [x] 8.2 Real-time Spreadsheet Collaboration (Financial Modeling)
- [x] 8.3 Collaborative Drawing & Diagramming (Whiteboard)
- [x] 9.1 AI-Powered Demand Forecasting (Predictive Inventory)
- [x] 9.2 Automated Low-Stock & Procurement Alerts (Smart Reordering)
- [x] 9.3 Multi-Warehouse Inventory Optimization (Smart Stock Balancing)
- [x] 10.1 Automated Financial Reconciliation (Bank Matching)

---

## 3. Latest Architecture Improvements (May 2026)

- **Automated Financial Reconciliation:** Implemented `BankReconciliationService` (Finance module) to automate the matching of bank transactions with internal ledger entries. The service uses a weighted scoring system based on exact amounts, date proximity (+/- 15 days), reference matching, and fuzzy description similarity (Dice Coefficient). Exposed endpoints for retrieving intelligent reconciliation suggestions and approving matches.
- **Multi-Warehouse Inventory Optimization:** Enhanced demand forecasting to support `warehouseId` granularity. Implemented `InventoryOptimizationService` which analyzes stock imbalances across locations and suggests "Smart Stock Transfers" to move surplus inventory to warehouses with predicted deficits.
  ...

---

## 5. Session Recovery Context

**LAST ACTION:**
Implemented Task 10.1: Automated Financial Reconciliation. Added `BankReconciliationService` with fuzzy matching and a confidence-based scoring system for bank-to-ledger matching.

**NEXT TASK:**
**Task 10.2: Automated Tax Filing & Compliance (Mushak).**
Enhance the compliance module by:

1.  Implementing `TaxFilingService` that aggregates VAT data into a draft Mushak 9.1 form.
2.  Adding "Filing Readiness Checks" that identify missing data (e.g., missing vendor BINs) before submission.
3.  Providing a one-click "Generate Filing Package" (ZIP with PDF 9.1 + supporting schedules).

---

## 6. Critical File Index

| File                                    | Purpose                                    |
| --------------------------------------- | ------------------------------------------ |
| `GEMINI.md`                             | Foundational mandates (READ FIRST)         |
| `docs/AI_START_HERE.md`                 | Session bootstrap & URLs                   |
| `docs/PRODUCTION_ROADMAP.md`            | Sellable-SaaS phases + module readiness    |
| `docs/NUROX_ERP_MASTER_ARCHITECTURE.md` | Deep reference only — do not load entirely |
| `README.md`                             | Docker quick start, scripts                |
