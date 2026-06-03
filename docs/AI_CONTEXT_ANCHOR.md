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
| **Audit Logs**         | ✅ Done | Global `AuditLogInterceptor` active on ALL mutation endpoints.         |
| **Form Consistency**   | ✅ Done | Core pages (HR, Inventory) refactored to RHF; 100% build pass.         |
| **One-Command Run**    | ✅ Done | `pnpm docker:up` verified with `scripts/docker-verify.js`              |
| **Session Continuity** | ✅ Done | `pnpm ai:context` protocol established and verified.                   |

---

## 2. Active Roadmap Progress

**Current Phase:** Phase 11 — Advanced Automation (SaaS Polish)

- [x] 11.1 Multi-Channel Customer Support AI (Sentiment & Suggestions)
- [x] 11.2 AI-Powered Knowledge Base Gap Analysis
- [ ] **Global Architectural Hardening (June 2026)**
  - [x] Hardened ALL core controllers (HR, Finance, Sales, Inventory, etc.) with Audit Logs & Zod.
  - [x] Standardized Frontend forms in core modules (HR, Inventory) using RHF + Zod.
  - [x] Fixed all type-safety and build errors; 100% project-wide `pnpm build` pass.
  - [x] Synced `NUROX_ERP_MASTER_ARCHITECTURE.md` (v2.5).

---

## 3. Latest Architecture Improvements (June 2026)

- **AI-Powered Knowledge Base Gap Analysis:** Implemented a new feature that analyzes ticket trends and compares them against existing Knowledge Base articles to identify content gaps. Suggestions are generated via AI and can be converted into draft articles with one click.
- **Global Architectural Hardening:** Completed a systemic refactor of all core backend controllers. All mutation endpoints now strictly apply the `AuditLogInterceptor` and `ZodValidationPipe`. Removed legacy `any` types and replaced them with explicit DTOs from `@repo/shared-schemas`.
- **Frontend Form Standardization:** Initiated a global transition from Ant Design's native forms to `react-hook-form` (RHF) using the "Liquid Precision" standardized wrappers. Core pages like `Departments` and `Products` now serve as the gold standard for future development.

---

## 5. Session Recovery Context

**LAST ACTION:**
Completed Task 11.2. Implemented `analyzeGap` logic in `SupportAiService`, exposed it via `KnowledgeBaseController`, and created a new frontend KB page in `apps/web/app/[locale]/(dashboard)/support/kb/page.tsx` with AI suggestions.

**NEXT TASK:**
**Task 11.3: Automated Support Ticket Routing.**
Implement a rule-based and AI-assisted routing system to assign tickets to the most relevant agents based on category and sentiment.

---

## 6. Critical File Index

| File                                    | Purpose                                    |
| --------------------------------------- | ------------------------------------------ |
| `GEMINI.md`                             | Foundational mandates (READ FIRST)         |
| `docs/AI_START_HERE.md`                 | Session bootstrap & URLs                   |
| `docs/PRODUCTION_ROADMAP.md`            | Sellable-SaaS phases + module readiness    |
| `docs/NUROX_ERP_MASTER_ARCHITECTURE.md` | Deep reference only — do not load entirely |
| `README.md`                             | Docker quick start, scripts                |
