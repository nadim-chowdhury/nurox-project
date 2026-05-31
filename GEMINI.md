# NUROX ERP — AI Development Guidelines (GEMINI.md)

> This file contains foundational mandates for all AI-driven development in the Nurox ERP project. Adherence to these rules is mandatory to ensure production readiness, consistency, and scalability.

## 0. Session Initialization (CRITICAL)

- **Mandate:** Any new AI session MUST read `docs/AI_START_HERE.md`, then `docs/AI_CONTEXT_ANCHOR.md`, before writing any code.
- **Context recovery:** Run `pnpm ai:context` when switching AI accounts; paste the clipboard into the new session. This is the **only** way to prevent context drift and ensure architectural integrity across multiple accounts.
- **Roadmap:** See `docs/PRODUCTION_ROADMAP.md` for sellable-SaaS phases; do not implement the entire master spec in one session.
- **Purpose:** The anchor file is the project's long-term memory. If it is not updated, the project will fail due to context loss.
- **Update Rule:** Upon completing a significant task, the AI MUST update `docs/AI_CONTEXT_ANCHOR.md` with the new status, exact current state, and next steps.
- **Scope:** Work one roadmap task at a time — never attempt full-module or multi-module rewrites in a single session.

## 1. Architectural Mandates

### 1.1 Multi-Tenancy

- **Backend:** Every tenant-scoped entity MUST include a `tenant_id` UUID column and extend `TenantBaseEntity`.
- **Backend:** All queries MUST be scoped by `tenant_id` via the `TenantMiddleware`, `TenantInterceptor`, or TypeORM `TenantSubscriber`.
- **Frontend:** Always include the `x-tenant-id` header in API requests (handled by `baseApi`).

### 1.2 RTK Query Standardization

- NEVER create a new `createApi` instance for a module.
- ALWAYS use `baseApi.injectEndpoints` from `@/store/api/baseApi`.
- ALWAYS provide appropriate `tagTypes` (e.g., `Invoice`, `Journal`, `ChartOfAccount`) for caching and invalidation.

### 1.3 Validation & Type Safety

- NEVER define local DTOs in controllers.
- ALWAYS use shared Zod schemas from `packages/shared-schemas`.
- Backend controllers MUST use `ZodValidationPipe` with the corresponding shared schema for ALL mutation endpoints.
- NO `any` allowed in business logic or entity mappings; use proper interfaces or `Zod.infer`.

## 2. Frontend Development Standards

### 2.1 UI Components

- **Primary Library:** Ant Design (antd) 6.x.
- **Styling:** Use Vanilla CSS or Tailwind spacing utilities. Avoid complex Tailwind configurations.
- **Design System:** Adhere to "Liquid Precision" — use CSS variables for colors (e.g., `var(--color-primary)`).
- **Forms (STRICT MANDATE):**
  - ALWAYS use `react-hook-form` (RHF) for form state management.
  - ALWAYS use `zodResolver` with shared schemas from `@repo/shared-schemas`.
  - Use standardized RHF wrappers from `@/components/common/forms/` (e.g., `RhfInput`, `RhfSelect`, `RhfDatePicker`, `RhfInputNumber`, `RhfTextArea`).
  - Pass the `control` and `name` props to these wrappers.
  - **Manual usage of `Form.Item` or standard Antd controls for input is prohibited.**

### 2.2 Standard Form Structure

```tsx
const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});

const onSubmit = (data) => { ... };

<form onSubmit={handleSubmit(onSubmit)}>
  <RhfInput name="field" control={control} label="Field Label" />
  <Button type="primary" htmlType="submit">Submit</Button>
</form>
```

### 2.3 Routing

- **App Router:** Use Next.js 16 App Router with `[locale]` segments for i18n.
- **Middleware:** Ensure routes are protected via `middleware.ts`.

## 3. Backend Development Standards

### 3.1 NestJS Modules

- **Modular Structure:** Each feature MUST be its own module in `apps/api/src/modules/`.
- **Entities:** Entities live inside the module folder (e.g., `modules/hr/entities/`).
- **Audit Logs:** Apply the `AuditLogInterceptor` to all mutation endpoints.

### 3.2 Database

- **Migrations:** NEVER use `synchronize: true` in production.
- **TypeORM:** Use the DataSource API for migrations and queries.

## 4. Quality & Testing

### 4.1 Automated Tests

- Every bug fix MUST include a reproduction test case.
- New features MUST have unit tests (Vitest/Jest).
- Critical flows MUST have Playwright E2E tests.

### 4.2 Code Style

- Run `pnpm lint` and `pnpm format` before every commit.
- Use explicit typing; avoid `any` unless absolutely necessary for external library compatibility.

## 5. Deployment & DevOps

- Use the provided Dockerfiles for containerization.
- Ensure `HPA` and `PDB` are considered for production deployments.
- All secrets MUST be managed via environment variables (never hardcoded).

## 6. Production Hardening Checklist (Definition of Done)

Every feature or refactor implemented by AI MUST meet this checklist before being considered complete:

- [ ] **Multi-Tenancy:** `tenant_id` isolation verified in backend DB queries and entities. Frontend requests carry correct tenant context.
- [ ] **Centralized Validation:** 100% boundary check using Zod schemas from `packages/shared-schemas`.
- [ ] **Audit Trail:** `AuditLogInterceptor` active on all mutation endpoints.
- [ ] **UI Consistency:** Forms strictly use standardized RHF wrappers. Direct Antd controls are removed.
- [ ] **Automated Verification:** Bug fixes have a reproduction test; new features have unit/integration tests or a Playwright E2E spec.
- [ ] **Code Quality:** No usage of `any`. `pnpm lint` and `pnpm format` pass.
- [ ] **Session Recovery:** `docs/AI_CONTEXT_ANCHOR.md` updated with exact current state to prevent context drift in subsequent sessions.
- [ ] **Infrastructure:** `pnpm docker:verify` passes, ensuring the "one-command" setup is healthy.
