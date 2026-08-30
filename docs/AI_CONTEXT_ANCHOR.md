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
- [x] 11.3 Automated Support Ticket Routing (Rule-based & AI Fallback)
- [ ] **Global Architectural Hardening (June 2026)**
  - [x] Hardened ALL core controllers (HR, Finance, Sales, Inventory, etc.) with Audit Logs & Zod.
  - [x] Standardized Frontend forms in core modules (HR, Inventory) using RHF + Zod.
  - [x] Fixed all type-safety and build errors; 100% project-wide `pnpm build` pass.
  - [x] Synced `NUROX_ERP_MASTER_ARCHITECTURE.md` (v2.5).

---

## 3. Latest Architecture Improvements (August 2026)

- **Systemic UI/UX & End-to-End Data Flow Resolution:**
  - Implemented automatic backend `TransformInterceptor` envelope unwrapping (`{ data, statusCode }` -> unwrapped payload) in `apps/web/lib/api-client.ts` across all 22 RTK Query API slices globally.
  - Fixed silent auth refresh token extraction and Redux tenant ID fallback injection in `baseQueryWithReauth`.
  - Configured Next.js reverse-proxy rewrites (`/api/v1/:path*`) in `apps/web/next.config.mjs` and dynamic `getApiUrl()` in `api-client.ts` to prevent broken `localhost:3001` hardcoding when deployed on remote servers, LAN IPs, or containerized environments.
  - Hardened API CORS policy in `main.ts` to dynamically accept localhost ports, LAN IPs, and custom domains without hard preflight rejections.
  - Injected `INTERNAL_API_URL` into `docker-compose.yml` for internal container-to-container SSR communication.
  - Upgraded `usePermission` hook to support `SUPER_ADMIN` and comprehensive permission fallbacks.
  - Implemented Module 18 (Reporting & Analytics) with `reportsApi.ts` RTK slice, custom report template creation, dynamic query execution, and direct PDF/Excel/CSV export handlers in `app/[locale]/(dashboard)/reports/page.tsx`.
  - Hardened Module 15 (Document Management) in `app/[locale]/(dashboard)/documents/page.tsx` with folder creation modal (`useCreateFolderMutation`), S3 presigned URL uploads, and soft-delete/restore operations.
  - Implemented Module 29 (Logistics & Fleet Management) with full backend query/mutation endpoints (`FleetController`, `FleetService`), `fleetApi.ts` RTK Query slice, AI route waypoint optimization, and `app/[locale]/(dashboard)/fleet/page.tsx` UI.
  - Implemented Module 27 (E-Commerce & POS Integration) with live session float opening/closing, active cart management, multi-payment tender, thermal receipt generation (`posApi.ts`, `PosController`, `app/[locale]/(dashboard)/pos/page.tsx`).
  - Hardened Module 8 (Recruitment & ATS) data arrays and safe candidate/job parsing in `app/[locale]/(dashboard)/hr/recruitment/page.tsx`.
  - Fixed `AuthProvider` blank screen flash by skipping unauthenticated `/auth/me` queries on public pages when no refresh token cookie exists.
  - Configured seeded tenant UUID fallback in `proxy.ts` (`d3b07384-d113-4c4e-9c8e-cf00257e8412`) so `localhost:3000` matches database tenant context out of the box.
  - Made App Router navigation locale-aware in `login/page.tsx`, `TopBar.tsx`, and `AppShell.tsx` to prevent broken 404 client navigation when redirecting to `/en/dashboard`.
  - Guarded Recharts and analytics widgets (`AnalyticsCharts.tsx`, `AlertsPanel.tsx`, `ActivityFeed.tsx`, `DashboardGrid.tsx`) against non-array payloads and added `SUPER_ADMIN` role support.

---

## 5. Session Recovery Context

**LAST ACTION:**
Implemented and verified Module 18 (Reporting & Analytics) and Module 15 (Document Management) alongside Module 29 (Logistics & Fleet) and Module 27 (POS & Retail) with complete full-stack API endpoints, RTK Query slices, and Liquid Precision frontend UI.

- **`pnpm check-types`**: 100% PASS (0 errors across 7 workspace packages).
- **`pnpm --filter api test`**: 100% PASS (26/26 NestJS test suites passed, 60/60 unit tests passed).
- **`pnpm lint`**: 100% PASS (0 errors across monorepo).
- **`pnpm build`**: 100% PASS (Production Next.js 16 + NestJS build successful).
- Synced state machine anchor.

**NEXT TASK:**
Continue step-by-step module hardening according to `docs/PRODUCTION_ROADMAP.md` and `docs/NUROX_ERP_MASTER_ARCHITECTURE.md`.

---

## 6. Critical File Index

| File                                    | Purpose                                        |
| --------------------------------------- | ---------------------------------------------- |
| `GEMINI.md`                             | Foundational mandates (READ FIRST)             |
| `docs/AI_START_HERE.md`                 | Session bootstrap & URLs                       |
| `docs/PRODUCTION_ROADMAP.md`            | Sellable-SaaS phases + module readiness        |
| `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`   | Full container deployment setup & architecture |
| `docs/NUROX_ERP_MASTER_ARCHITECTURE.md` | Deep reference only — do not load entirely     |
| `README.md`                             | Docker quick start, scripts                    |
