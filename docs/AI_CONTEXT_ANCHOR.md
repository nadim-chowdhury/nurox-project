# NUROX ERP — AI Context Anchor

> **Last Updated:** May 2026
> **Active Goal:** Phase 3: Financial Core & Supply Chain Hardening
> **Status:** Core HR & Payroll Hardened (Global Audit, Zod Pipes, Tenant Scoping, Payroll State Machine established)

## 1. Current State of the Project

- **Architecture:** v2.3 (AI Guardrails injected, Global Audit Log active).
- **Core State:** Redux Store refactored; Backend HR/Attendance/Leave/Payroll modules hardened.
- **Validation:** 100% Zod boundary checks enforced in HR/Attendance/Leave/Payroll controllers via `ZodValidationPipe`.
- **Tenancy:** Core services (`HrService`, `AttendanceService`, `LeaveService`, `PayrollService`) hardened with explicit `tenant_id` scoping.
- **Frontend:** Standardized RHF wrappers (Input, Select, Date, Number, Rate, Range) 100% utilized in HR forms.
- **State Machine:** Robust Payroll Run lifecycle implemented (Draft -> Processing -> Review -> Approved -> Processed -> Paid).

## 2. Active Development Frontier

- [x] **Task 2.1:** Refactor major HR components to RHF standard (Wizard, Modals).
- [x] **Task 2.2:** Implement AI Guardrails and Production Hardening Checklist.
- [x] **Task 2.3:** Harden HR Backend (Auditing, Validation, Scoping).
- [x] **Task 2.4:** Standardize remaining backend modules (Leave, Payroll, Attendance) with `ClsService` and `ZodValidationPipe`.
- [x] **Task 2.5:** Implement "Production Payroll Run" state machine.
- [ ] **Task 3.1:** Harden Finance module (Chart of Accounts, Ledger) with strict tenant isolation and audit logging.
- [ ] **Task 3.2:** Implement automated journal posting for processed payroll runs.
- [ ] **Task 3.3:** Refactor Procurement and Inventory forms to RHF standard.

## 3. Pending Critical Fixes

- [x] Ensure `middleware.ts` correctly extracts `x-tenant-id`.
- [x] Implement and register global `AuditLogInterceptor`.
- [x] Audit `AttendanceService` for missing manual tenant scoping in complex queries.

## 4. How to Resume (For AI)

1. Read `GEMINI.md` for coding standards.
2. Read `docs/NUROX_ERP_MASTER_ARCHITECTURE.md` for the blueprint.
3. Start from the first unchecked item in **Section 2: Active Development Frontier**.
