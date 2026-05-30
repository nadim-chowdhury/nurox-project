# NUROX ERP — AI Start Here (Read This First)

> **Do not read the full `NUROX_ERP_MASTER_ARCHITECTURE.md` (3000+ lines) every session.**
> That file is the encyclopedia. This file is the operating manual.

---

## 1. Session bootstrap (every new AI account / session)

1. Read **`GEMINI.md`** (coding rules).
2. Read **`docs/AI_CONTEXT_ANCHOR.md`** (current phase, completed tasks, next task).
3. Skim **`docs/PRODUCTION_ROADMAP.md`** if you need module readiness or sellable-SaaS scope.
4. Run **`pnpm ai:context`** and paste the clipboard into the new chat if context was lost.
5. Work **one task only** from the anchor file — never “implement all modules.”
6. Before ending: update **`docs/AI_CONTEXT_ANCHOR.md`**, run **`pnpm lint`**, and note test results.

---

## 2. One-command run (production-like Docker)

Full stack (API + Web + Postgres + Redis + MinIO + MeiliSearch + MailHog):

```bash
pnpm install
pnpm docker:up
pnpm docker:verify   # optional: wait until API + web respond
```

| Service    | URL                              |
| ---------- | -------------------------------- |
| Web app    | http://localhost:3000/en/login   |
| API        | http://localhost:3001/api/v1     |
| API health | http://localhost:3001/api/health |
| API docs   | http://localhost:3001/api/docs   |
| MailHog UI | http://localhost:8025            |
| MinIO UI   | http://localhost:9001            |

**Default login (auto-seeded on first boot):**

- Email: `admin@nurox.app`
- Password: `password123`
- Tenant ID (E2E / headers): `d3b07384-d113-4c4e-9c8e-cf00257e8412`

Stop: `pnpm docker:down` · Logs: `pnpm docker:logs`

---

## 3. Hybrid dev (hot reload — recommended for daily coding)

Run infrastructure only, then apps locally:

```bash
pnpm docker:infra    # Postgres, Redis, MinIO, MeiliSearch, MailHog
pnpm dev             # Turbo: api + web with HMR
```

Copy env templates:

```bash
cp apps/api/.env.example apps/api/.env
# apps/web: set NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 in .env.local
```

---

## 4. Environment variable rule (critical)

`NEXT_PUBLIC_API_URL` must be the **full API base** including `/api/v1`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

RTK Query uses this value directly as `baseUrl` — do **not** append `/api` again.

---

## 5. Architectural non-negotiables

| Rule          | Requirement                                                   |
| ------------- | ------------------------------------------------------------- |
| Multi-tenancy | Every entity scoped by `tenant_id`; queries filtered          |
| Validation    | Zod schemas in `packages/shared-schemas` only — no local DTOs |
| Mutations     | `AuditLogInterceptor` on POST/PUT/PATCH/DELETE                |
| Forms (web)   | RHF + `zodResolver` + `@/components/common/forms/*` wrappers  |
| API state     | `baseApi.injectEndpoints` only — never new `createApi`        |
| Types         | No `any` — use `unknown` + guards or proper interfaces        |

**Definition of done:** checklist in `GEMINI.md` §6.

---

## 6. Step-by-step roadmap (do not skip phases)

| Phase | Focus                                     | Status              |
| ----- | ----------------------------------------- | ------------------- |
| 0     | Docker, build, global Zod pipe, auto-seed | ✅ Done             |
| 1     | Auth, RLS, RBAC permissions               | ✅ Done             |
| 2     | Finance core, BD VAT Mushak               | ✅ Done             |
| 3     | Inventory, Manufacturing                  | ✅ Done             |
| 4     | Procurement, Sales revenue API            | ✅ Done             |
| 5     | E2E, sales UI, quality                    | 🔄 In progress      |
| 6     | Sellable SaaS (billing, onboarding)       | ⬜ Next major block |
| 7     | Per-module hardening                      | Ongoing             |

Full detail: **`docs/PRODUCTION_ROADMAP.md`**. **Next task:** `docs/AI_CONTEXT_ANCHOR.md` §5.

---

## 7. What NOT to do (common AI mistakes)

- Do not enable `DB_SYNCHRONIZE=true` in production.
- Do not create module-specific `createApi` instances.
- Do not use raw Ant Design inputs in forms.
- Do not implement 692 features in one session.
- Do not trust session memory — trust **git + anchor file**.
- Do not read duplicate docs: prefer this file + anchor over re-scanning the whole monorepo.

---

## 8. Key file map

| Purpose                 | Path                                               |
| ----------------------- | -------------------------------------------------- |
| AI rules                | `GEMINI.md`                                        |
| Live progress           | `docs/AI_CONTEXT_ANCHOR.md`                        |
| Production roadmap      | `docs/PRODUCTION_ROADMAP.md`                       |
| Master spec (reference) | `docs/NUROX_ERP_MASTER_ARCHITECTURE.md`            |
| API contract            | `docs/API_CONTRACT.md`                             |
| Business rules          | `docs/BUSINESS_LOGIC.md`                           |
| Full Docker stack       | `docker-compose.yml` + `.env.docker`               |
| Infra-only (hybrid dev) | `infra/docker/docker-compose.yml`                  |
| Shared validation       | `packages/shared-schemas/`                         |
| Web API client          | `apps/web/lib/api-client.ts`                       |
| Auto seed               | `apps/api/src/database/seeds/auto-seed.service.ts` |

---

## 9. Verification before marking a task complete

```bash
pnpm lint
pnpm build          # full monorepo
pnpm test           # when tests exist for the module
```

For Docker smoke test after infra changes:

```bash
pnpm docker:up
pnpm docker:verify
# or: curl -f http://localhost:3001/api/health
```

## 10. E2E tests (Playwright)

With the stack running (`pnpm docker:up` or local `pnpm dev` + API):

```bash
# API flow: quotation → SO → invoice + Mushak 6.3
pnpm test:e2e:api

# UI smoke: login page
pnpm test:e2e:ui

# Both
pnpm test:e2e
```

Env overrides: `E2E_API_URL`, `E2E_WEB_URL`, `E2E_TENANT_ID`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`.
Use `E2E_SKIP_WEBSERVER=1` when servers are already running.

---

_Last updated: May 2026 — keep in sync with `docs/AI_CONTEXT_ANCHOR.md`._
