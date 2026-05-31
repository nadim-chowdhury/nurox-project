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
| **One-Command Run**    | ✅ Done | `pnpm docker:up` builds and seeds entire stack (Tiptap fix applied)    |
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
- [x] 10.2 Automated Tax Filing & Compliance (Mushak 9.1)
- [x] 10.3 Automated Vendor Payment Batching (Bulk Payouts)

---

## 3. Latest Architecture Improvements (May 2026)

- **Automated Vendor Payment Batching:** Implemented `PaymentBatchService` (Finance module) to streamline vendor payouts. The system allows grouping multiple approved bills into a single batch, automatically fetching vendor bank details, and generating CSV instruction files for bank processing (e.g., BEFTN). Finalizing a batch automatically updates bill payment statuses and paid amounts.
- **Automated Tax Filing & Compliance:** Implemented `TaxFilingService` (Compliance module) to automate the preparation of VAT returns. Features include "Filing Readiness Checks" that validate company BIN and vendor tax data for a given period, and "Filing Package Generation" which creates a ZIP archive containing the Mushak 9.1 PDF and structured data summaries.
  ...

---

## 5. Session Recovery Context

**LAST ACTION:**
Resolved Tiptap dependency conflicts and fixed `web` build failure. Verified that `pnpm build` and `pnpm lint` pass for the entire monorepo. The project is now fully ready for one-command Docker deployment.

**NEXT TASK:**
**Task 11.1: Multi-Channel Customer Support AI.**
Enhance the support module with AI-driven automation by:

1.  Implementing `SupportAiService` that uses OpenAI to analyze incoming support tickets and suggest resolutions based on the knowledge base.
2.  Adding "Sentiment Analysis" to tickets to prioritize frustrated customers.
3.  Providing an API for "Auto-Reply Suggestions" in the support agent UI.

---

## 6. Critical File Index

| File                                    | Purpose                                    |
| --------------------------------------- | ------------------------------------------ |
| `GEMINI.md`                             | Foundational mandates (READ FIRST)         |
| `docs/AI_START_HERE.md`                 | Session bootstrap & URLs                   |
| `docs/PRODUCTION_ROADMAP.md`            | Sellable-SaaS phases + module readiness    |
| `docs/NUROX_ERP_MASTER_ARCHITECTURE.md` | Deep reference only — do not load entirely |
| `README.md`                             | Docker quick start, scripts                |
