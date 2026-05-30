# NUROX ERP

Multi-tenant SaaS ERP — HR, Payroll, Finance, Inventory, Sales, Manufacturing, and more.

**Stack:** Next.js 16 · NestJS 11 · PostgreSQL 17 · Redis · TypeORM · Ant Design 6 · RTK Query · Zod · Turborepo

---

## Quick start (one command — full production-like stack)

```bash
pnpm install
pnpm docker:up
pnpm docker:verify   # optional smoke check
```

Open **http://localhost:3000/en/login**

| Service | URL                            |
| ------- | ------------------------------ |
| Web     | http://localhost:3000          |
| API     | http://localhost:3001/api/v1   |
| Swagger | http://localhost:3001/api/docs |
| MailHog | http://localhost:8025          |

**Default credentials** (auto-created on first API boot):

- Email: `admin@nurox.app`
- Password: `password123`

```bash
pnpm docker:logs    # follow logs
pnpm docker:down    # stop all services
```

---

## Local development (hot reload)

Infrastructure in Docker, apps on the host:

```bash
pnpm docker:infra   # Postgres, Redis, MinIO, MeiliSearch, MailHog only
cp apps/api/.env.example apps/api/.env
pnpm dev            # API :3001 + Web :3000
```

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## AI-assisted development

This project is built for **multi-session, multi-account AI** workflows:

1. AI reads `GEMINI.md` + `docs/AI_START_HERE.md` + `docs/AI_CONTEXT_ANCHOR.md`
2. AI works **one roadmap task** at a time
3. Run `pnpm ai:context` before switching accounts — paste into the new session

See **`docs/AI_START_HERE.md`** for the full playbook.

---

## Documentation

| Document                                                     | Purpose                                       |
| ------------------------------------------------------------ | --------------------------------------------- |
| [AI Start Here](docs/AI_START_HERE.md)                       | Session bootstrap, Docker, rules (read first) |
| [AI Context Anchor](docs/AI_CONTEXT_ANCHOR.md)               | Current phase and next task                   |
| [Production Roadmap](docs/PRODUCTION_ROADMAP.md)             | Step-by-step path to sellable SaaS            |
| [Master Architecture](docs/NUROX_ERP_MASTER_ARCHITECTURE.md) | Full spec (~692 features, 30 modules)         |
| [API Contract](docs/API_CONTRACT.md)                         | REST conventions                              |
| [Business Logic](docs/BUSINESS_LOGIC.md)                     | Domain rules                                  |

---

## Monorepo structure

```
apps/
  api/          NestJS backend
  web/          Next.js frontend
packages/
  shared-schemas/   Zod schemas (shared FE/BE)
  ui/               Shared UI components
  ui-tokens/        Design tokens
infra/
  docker/       Infrastructure-only compose (hybrid dev)
  k8s/          Kubernetes / Helm
```

---

## Scripts

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `pnpm dev`           | Start api + web in dev mode                 |
| `pnpm build`         | Build entire monorepo                       |
| `pnpm lint`          | Lint all packages                           |
| `pnpm docker:up`     | Full stack (API + Web + infra)              |
| `pnpm docker:verify` | Wait for API + web health after `docker:up` |
| `pnpm docker:infra`  | Infra only (for `pnpm dev`)                 |
| `pnpm docker:down`   | Stop Docker services                        |
| `pnpm ai:context`    | Copy session context to clipboard           |

---

## License

Proprietary — Nurox ERP.
