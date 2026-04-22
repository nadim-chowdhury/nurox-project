# NUROX ERP — Ultimate SaaS Master Documentation

> **Version:** 2.1 · **Last Updated:** April 2026
> **Stack:** Next.js 16 · NestJS 11 · TypeORM 1.0 · PostgreSQL 18 · Ant Design 6.x · RTK Query · Custom JWT Auth (Passport.js)
> **Design System:** Liquid Precision — "The Architectural Infinite"
> **Architecture:** Multi-Tenant SaaS · Module-Based · API-First · Event-Driven

---

## Table of Contents

1. [Complete Tech Stack](#1-complete-tech-stack)
2. [Design System — Liquid Precision](#2-design-system--liquid-precision)
3. [Ant Design Integration & Theming](#3-ant-design-integration--theming)
4. [Complete File & Folder Structure](#4-complete-file--folder-structure)
5. [Frontend Architecture Patterns](#5-frontend-architecture-patterns)
6. [Backend Architecture Patterns](#6-backend-architecture-patterns)
7. [SaaS Infrastructure & Multi-Tenancy](#7-saas-infrastructure--multi-tenancy)
8. [Feature Modules (1–30)](#8-feature-modules-1-30)
   - [Module 1: Core Platform & Infrastructure](#module-1-core-platform--infrastructure)
   - [Module 2: Authentication & Authorization](#module-2-authentication--authorization)
   - [Module 3: User & Organization Management](#module-3-user--organization-management)
   - [Module 4: Dashboard & Analytics](#module-4-dashboard--analytics)
   - [Module 5: Human Resources](#module-5-human-resources)
   - [Module 6: Payroll Management](#module-6-payroll-management)
   - [Module 7: Attendance & Leave](#module-7-attendance--leave)
   - [Module 8: Recruitment & Onboarding](#module-8-recruitment--onboarding)
   - [Module 9: Finance & Accounting](#module-9-finance--accounting)
   - [Module 10: Inventory Management](#module-10-inventory-management)
   - [Module 11: Procurement & Purchase](#module-11-procurement--purchase)
   - [Module 12: Sales & CRM](#module-12-sales--crm)
   - [Module 13: Project Management](#module-13-project-management)
   - [Module 14: Asset Management](#module-14-asset-management)
   - [Module 15: Document Management](#module-15-document-management)
   - [Module 16: Notification & Communication](#module-16-notification--communication)
   - [Module 17: Audit Logs & Compliance](#module-17-audit-logs--compliance)
   - [Module 18: Reporting & Exports](#module-18-reporting--exports)
   - [Module 19: System Administration](#module-19-system-administration)
   - [Module 20: API & Integration Layer](#module-20-api--integration-layer)
   - [Module 21: Security Hardening](#module-21-security-hardening)
   - [Module 22: DevOps & Deployment](#module-22-devops--deployment)
   - [Module 23: SaaS Billing & Subscription](#module-23-saas-billing--subscription)
   - [Module 24: Customer Support & Help Desk](#module-24-customer-support--help-desk)
   - [Module 25: AI & Automation Layer](#module-25-ai--automation-layer)
   - [Module 26: Mobile & PWA](#module-26-mobile--pwa)
   - [Module 27: E-Commerce & POS Integration](#module-27-e-commerce--pos-integration)
   - [Module 28: Manufacturing & Production](#module-28-manufacturing--production)
   - [Module 29: Logistics & Fleet Management](#module-29-logistics--fleet-management)
   - [Module 30: Compliance, Tax & Regulatory](#module-30-compliance-tax--regulatory)
9. [SaaS Go-To-Market Strategy](#9-saas-go-to-market-strategy)
10. [Appendices](#10-appendices)

---

## 1. Complete Tech Stack

### 1.1 Frontend

| Category                | Technology                       | Version            | Purpose                                                                                                              |
| ----------------------- | -------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Framework               | Next.js                          | 16 (App Router)    | SSR, SSG, RSC, routing                                                                                               |
| Language                | TypeScript                       | 5.x                | Type safety                                                                                                          |
| UI Component Library    | **Ant Design (antd)**            | **6.x**            | Primary component library — CSS Variables mode (no Less); forms, tables, modals, date pickers, upload, notifications |
| Layout Utilities        | TailwindCSS                      | 4.x                | Spacing, flex, grid utilities only — CSS-first config via `@theme` directive (no tailwind.config.js)                 |
| Icons                   | @ant-design/icons + Lucide React | 6.x                | Icon set (antd icons primary, lucide for custom)                                                                     |
| Form Management         | React Hook Form                  | 7.x                | Performant form state                                                                                                |
| Schema Validation       | Zod                              | 4.x                | Runtime validation (shared frontend ↔ backend via `@repo/shared-schemas`)                                            |
| RHF + Zod Bridge        | @hookform/resolvers              | latest             | `zodResolver` integration                                                                                            |
| State Management        | Redux Toolkit                    | 2.x                | Global UI state only (excluding server & form state)                                                                 |
| Server State / API      | RTK Query                        | (bundled with RTK) | Data fetching, caching, mutations                                                                                    |
| Auth State Persistence  | redux-persist                    | latest             | Persist auth slice to localStorage                                                                                   |
| Auth (Frontend Session) | Custom JWT (Redux + httpOnly)    | —                  | Token storage in Redux (memory) + httpOnly refresh cookie                                                            |
| Rich Text Editor        | Tiptap                           | 2.x                | Descriptions, announcements, notes                                                                                   |
| Date Handling           | dayjs + date-fns                 | latest + 3.x       | dayjs required by antd DatePicker; date-fns for utility formatting/arithmetic                                        |
| Charts                  | Recharts                         | 2.x                | Bar, Line, Area, Pie, Donut                                                                                          |
| Data Tables             | TanStack Table                   | 8.x                | Advanced client-side filtering/sorting on large (10k+ row) virtualized datasets                                      |
| Virtualization          | TanStack Virtual                 | 3.x                | Large list rendering                                                                                                 |
| Drag & Drop             | @dnd-kit/core                    | 6.x                | Kanban boards, sortable lists                                                                                        |
| File Upload             | antd Upload                      | —                  | Drag-and-drop file input                                                                                             |
| PDF Viewer              | react-pdf                        | 7.x                | In-app PDF preview                                                                                                   |
| Toast Notifications     | antd message + notification API  | —                  | Non-blocking toasts                                                                                                  |
| Animations              | Motion (`motion/react`)          | 12.x               | Page transitions, micro-interactions (formerly Framer Motion — rebranded 2025)                                       |
| Real-time               | Socket.io Client                 | 4.x                | WebSocket connection                                                                                                 |
| i18n                    | next-intl                        | 3.x                | Multi-language + locale routing                                                                                      |
| Component Docs          | Storybook                        | 8.x                | Component development and documentation                                                                              |
| Testing                 | Vitest + Testing Library         | latest             | Unit + component tests                                                                                               |
| E2E Testing             | Playwright                       | latest             | Critical flow automation                                                                                             |
| Linting                 | ESLint (flat config)             | 9.x                | Code quality                                                                                                         |
| Formatting              | Prettier                         | 3.x                | Code formatting                                                                                                      |
| Command Palette         | cmdk                             | latest             | ⌘K global search                                                                                                     |
| Maps                    | Mapbox GL JS                     | 3.x                | Geo-fenced attendance, fleet tracking                                                                                |
| Gantt                   | @dhtmlx/gantt                    | latest             | Project timeline rendering                                                                                           |
| Org Chart               | react-d3-tree                    | 3.x                | Visual org chart                                                                                                     |
| Signature               | react-signature-canvas           | latest             | HTML5 canvas e-signature capture                                                                                     |
| QR Code                 | qrcode.react                     | 3.x                | QR code generation for check-in                                                                                      |
| Barcode                 | react-barcode                    | latest             | Product/asset barcode rendering                                                                                      |
| Camera                  | react-webcam                     | latest             | Biometric/photo capture                                                                                              |

### 1.2 Backend

| Category            | Technology                         | Version | Purpose                                                     |
| ------------------- | ---------------------------------- | ------- | ----------------------------------------------------------- |
| Framework           | NestJS                             | 11.x    | Modular Node.js backend                                     |
| Language            | TypeScript                         | 5.x     | Strict type safety                                          |
| ORM                 | TypeORM                            | 1.0.x   | Database access, migrations, relations (DataSource API)     |
| Database            | PostgreSQL                         | 18      | Primary relational store                                    |
| Cache               | Redis                              | 7.x     | Session, cache, rate limit store                            |
| Queue               | BullMQ                             | 5.x     | Background jobs, email, payroll runs                        |
| Auth                | Passport.js + JWT                  | latest  | Core backend authentication / token verification            |
| JWT                 | @nestjs/jwt                        | latest  | Access + refresh token signing (RS256)                      |
| Password Hashing    | bcrypt                             | 5.x     | saltRounds=12                                               |
| Validation          | nestjs-zod                         | 5.1.x   | DTO validation pipe — Zod 4 compatible with codec support   |
| API Docs            | @nestjs/swagger                    | latest  | Auto-generated Swagger UI at `/api/docs`                    |
| File Storage        | MinIO SDK                          | latest  | S3-compatible object storage                                |
| Email               | Nodemailer + Handlebars            | latest  | Transactional email with templates                          |
| SMS                 | Twilio SDK / BD SSLCOMMERZ gateway | latest  | OTP and alerts                                              |
| PDF Generation      | Puppeteer                          | 24.x    | Payslips, invoices, reports                                 |
| Excel Export        | ExcelJS                            | 4.x     | XLSX report exports                                         |
| Logging             | Pino                               | 9.x     | Structured JSON logging                                     |
| Error Tracking      | Sentry Node SDK                    | 8.x     | Backend exception monitoring                                |
| Scheduling          | @nestjs/schedule                   | latest  | Cron-triggered jobs                                         |
| Config              | @nestjs/config + Zod               | latest  | Env validation at boot (consistent with shared Zod schemas) |
| Throttling          | @nestjs/throttler                  | latest  | Rate limiting per IP and API key (Redis store)              |
| Health Check        | @nestjs/terminus                   | latest  | `/health` endpoint                                          |
| Testing             | Jest + Supertest                   | latest  | Unit + integration + API tests                              |
| DB Migration CLI    | TypeORM CLI                        | 1.0.x   | `typeorm migration:run` — DataSource API (no Connection)    |
| Event Bus           | EventEmitter2                      | latest  | Cross-module async events                                   |
| Search              | MeiliSearch                        | 1.x     | Full-text product/employee/document search                  |
| AI                  | OpenAI SDK / Anthropic SDK         | latest  | AI assistant, smart suggestions                             |
| OCR                 | Tesseract.js (NestJS worker)       | 5.x     | Receipt / document scanning                                 |
| Barcode Scanner     | zxing-js                           | latest  | Barcode/QR decode on server                                 |
| Geo-coding          | node-geocoder                      | latest  | Address ↔ coordinates                                       |
| Currency Rates      | fixer.io / Open Exchange Rates API | —       | Live exchange rate fetching                                 |
| Payment Gateway     | Stripe SDK / SSLCommerz            | latest  | SaaS billing + customer payments                            |
| IP Geo              | geoip-lite                         | latest  | Login geo-tagging                                           |
| Analytics (Backend) | PostHog Node SDK                   | latest  | Product analytics events                                    |

### 1.3 Infrastructure & DevOps

| Category           | Technology                            | Purpose                                  |
| ------------------ | ------------------------------------- | ---------------------------------------- |
| Containerization   | Docker + Docker Compose               | Local dev and production packaging       |
| Orchestration      | Kubernetes + Helm                     | Production cluster management            |
| CI/CD              | GitHub Actions                        | Lint → Test → Build → Deploy pipeline    |
| Reverse Proxy      | Nginx                                 | SSL termination, static assets           |
| SSL                | Let's Encrypt + cert-manager          | Automated TLS certificates               |
| Secret Management  | HashiCorp Vault / AWS Secrets Manager | Production secrets                       |
| Metrics            | Prometheus + Grafana                  | Resource and application metrics         |
| Logs               | Loki + Grafana                        | Centralized log aggregation              |
| Tracing            | OpenTelemetry + Jaeger                | Distributed request tracing              |
| Error Tracking     | Sentry                                | Frontend + backend error monitoring      |
| Uptime             | Better Uptime                         | Alerting and status page                 |
| DB Connection Pool | PgBouncer                             | PostgreSQL connection pooling            |
| Object Storage     | MinIO / AWS S3                        | File and document storage                |
| Search Engine      | MeiliSearch                           | Self-hosted full-text search             |
| CDN                | Cloudflare                            | Static asset delivery + DDoS protection  |
| DNS                | Cloudflare DNS                        | Wildcard subdomain routing               |
| Feature Flags      | Unleash (self-hosted) / Redis flags   | Per-tenant feature toggles               |
| Product Analytics  | PostHog (self-hosted)                 | User behavior tracking                   |
| Monorepo           | Turborepo                             | Build orchestration across apps/packages |

### 1.4 Monorepo Structure

```
nurox-erp/                          # Turborepo root
├── apps/
│   ├── web/                        # Next.js 16 frontend
│   ├── api/                        # NestJS 11 backend
│   └── storybook/                  # Storybook component docs (Phase 2 — after core UI stabilizes)
├── packages/
│   ├── ui/                         # Shared React component library
│   ├── ui-tokens/                  # Design system tokens (colors, typography, spacing)
│   ├── shared-schemas/             # Shared Zod 4 DTOs (frontend + backend) — @repo/shared-schemas
│   ├── config-eslint/              # Shared ESLint config
│   ├── config-typescript/          # Shared tsconfig bases
│   └── utils/                      # Shared utility functions (TODO: create)
├── infra/
│   ├── docker/                     # Docker Compose files
│   ├── k8s/                        # Kubernetes manifests + Helm chart
│   └── terraform/                  # Infrastructure as code
├── scripts/                        # Dev utility scripts
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 2. Design System — Liquid Precision

> **North Star:** "The Architectural Infinite" — treat digital interfaces as expansive, high-end physical environments. Enterprise data should feel like a curated editorial experience.

### 2.1 Brand Identity

```
Logo: Isometric cube mark (geometric precision + modularity metaphor)
Wordmark: "nurox" — lowercase, Space Grotesk Medium
Primary Brand Colors: Deep Navy #1B2A4A + Slate #6B7FA3 (logo palette)
UI Theme: "Deep Space" dark mode (default) with light mode variant
```

### 2.2 Color Tokens

```typescript
// packages/ui-tokens/src/colors.ts
export const colors = {
  // Backgrounds
  background: "#0c1324", // Deep Space — page root
  surface_container_lowest: "#070d1f", // Deepest layer — row stripes
  surface_container_low: "#111827", // Section/card base
  surface_container: "#1a2235", // Default container
  surface_container_high: "#222c42", // Hover state surface
  surface_container_highest: "#2e3447", // Tooltips, badges

  // Primary (Electric Cyan)
  primary: "#c3f5ff", // Main accent — use sparingly
  primary_container: "#00e5ff", // Gradient end / button bg
  primary_fixed_dim: "#80d8ff", // Glow / hover emit

  // On-colors (text on colored surfaces)
  on_primary: "#003c4a", // Text on primary
  on_surface: "#e8eaf0", // Primary body text
  on_surface_variant: "#9aa5be", // Secondary/label text

  // Tertiary (Silver/Slate)
  tertiary: "#e3eeff", // Secondary data points
  outline_variant: "#3d4a63", // Ghost borders (15% use only)

  // Semantic
  error: "#ffb4ab",
  error_container: "#93000a",
  success: "#6dd58c",
  warning: "#ffb347",
  info: "#c3f5ff",

  // Status colors
  status_active: "#6dd58c",
  status_pending: "#ffb347",
  status_inactive: "#9aa5be",
  status_draft: "#80d8ff",
  status_cancelled: "#ffb4ab",

  // Logo-derived
  brand_navy: "#1B2A4A",
  brand_slate: "#6B7FA3",
} as const;
```

### 2.3 Typography

```typescript
// packages/ui-tokens/src/typography.ts
export const fonts = {
  display: '"Space Grotesk", sans-serif', // Headlines, KPI numbers, wordmark
  body: '"Manrope", sans-serif', // All body text, labels, tables
};

export const typeScale = {
  "display-lg": {
    fontSize: "3.5rem",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    font: "display",
  },
  "display-md": {
    fontSize: "2.5rem",
    lineHeight: 1.15,
    letterSpacing: "-0.015em",
    font: "display",
  },
  "display-sm": {
    fontSize: "1.75rem",
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    font: "display",
  },
  "headline-lg": {
    fontSize: "1.25rem",
    lineHeight: 1.3,
    letterSpacing: "-0.005em",
    font: "display",
  },
  "headline-md": { fontSize: "1.125rem", lineHeight: 1.35, font: "display" },
  "body-lg": { fontSize: "1rem", lineHeight: 1.6, font: "body" },
  "body-md": { fontSize: "0.875rem", lineHeight: 1.55, font: "body" },
  "body-sm": { fontSize: "0.75rem", lineHeight: 1.5, font: "body" },
  "label-md": {
    fontSize: "0.75rem",
    lineHeight: 1.4,
    letterSpacing: "0.04em",
    font: "body",
  },
  "label-sm": {
    fontSize: "0.6875rem",
    lineHeight: 1.4,
    letterSpacing: "0.05em",
    font: "body",
  },
};
```

### 2.4 Spacing & Elevation

```typescript
// packages/ui-tokens/src/spacing.ts
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
  "4xl": "96px",
};

// packages/ui-tokens/src/elevation.ts
export const elevation = {
  ghost_border: "rgba(61, 74, 99, 0.15)",
  glass: { background: "rgba(26, 34, 53, 0.6)", backdropFilter: "blur(20px)" },
  shadow_float: "0px 24px 48px rgba(7, 13, 31, 0.4)",
  shadow_card: "0px 8px 24px rgba(7, 13, 31, 0.3)",
};
```

### 2.5 Design Rules (Enforced)

| Rule                   | ✅ Do                                                    | ❌ Don't                              |
| ---------------------- | -------------------------------------------------------- | ------------------------------------- |
| Section separation     | Background color shift between surface tiers             | 1px solid borders                     |
| Table rows             | Alternate `surface_container_lowest` / `surface` stripes | Horizontal divider lines              |
| Floating elements      | Glassmorphism (`surface_variant` 60% + blur 20px)        | Solid opaque backgrounds on dropdowns |
| Primary CTA            | Gradient `primary` → `primary_container` at 135°         | Flat solid fills                      |
| Shadows                | Ambient, tinted (`rgba(7,13,31,...)`)                    | Grey box shadows or 0-blur drops      |
| Borders (if needed)    | Ghost: `outline_variant` at 15% opacity                  | Full-opacity borders                  |
| Roundness — containers | `0.25rem` (DEFAULT) or none                              | `full` pill on structural containers  |
| Colors                 | Use surface/on_surface tokens                            | Pure black `#000` or white `#fff`     |
| Numbers (dashboards)   | Space Grotesk always                                     | Mixed fonts on KPI values             |

### 2.6 Component Conventions

```typescript
// Standard StatusTag component used across all modules
// packages/ui/src/components/StatusTag.tsx
import { Tag } from 'antd'

const statusColorMap: Record<string, string> = {
  ACTIVE:     '#6dd58c', APPROVED:  '#6dd58c', PAID:       '#6dd58c', COMPLETED: '#6dd58c',
  PENDING:    '#ffb347', DRAFT:     '#80d8ff', IN_REVIEW:  '#c3f5ff', OPEN:       '#c3f5ff',
  INACTIVE:   '#9aa5be', CANCELLED: '#ffb4ab', REJECTED:   '#ffb4ab', OVERDUE:    '#ffb4ab',
  SUSPENDED:  '#ffb347', PROCESSING:'#80d8ff', PARTIAL:    '#ffb347',
}

export function StatusTag({ status }: { status: string }) {
  const color = statusColorMap[status] ?? '#9aa5be'
  return (
    <Tag style={{
      background: `${color}18`, color, border: `1px solid ${color}30`,
      borderRadius: 2, fontSize: 11, letterSpacing: '0.04em', fontWeight: 600,
    }}>
      {status.replace(/_/g, ' ')}
    </Tag>
  )
}
```

---

## 3. Ant Design Integration & Theming

### 3.1 Global AntdProvider

```typescript
// apps/web/components/providers/AntdProvider.tsx
'use client'
import React from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import type { ThemeConfig } from 'antd'

const nuroxTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary:        '#c3f5ff',
    colorPrimaryHover:   '#80d8ff',
    colorPrimaryActive:  '#00e5ff',
    colorBgBase:         '#0c1324',
    colorBgContainer:    '#1a2235',
    colorBgElevated:     '#222c42',
    colorBgLayout:       '#111827',
    colorBgSpotlight:    '#2e3447',
    colorText:           '#e8eaf0',
    colorTextSecondary:  '#9aa5be',
    colorTextTertiary:   '#e3eeff',
    colorTextDisabled:   'rgba(232,234,240,0.3)',
    colorBorder:         'rgba(61,74,99,0.15)',
    colorBorderSecondary:'rgba(61,74,99,0.10)',
    colorSplit:          'rgba(61,74,99,0.12)',
    colorError:          '#ffb4ab',
    colorSuccess:        '#6dd58c',
    colorWarning:        '#ffb347',
    colorInfo:           '#c3f5ff',
    fontFamily:          '"Manrope", -apple-system, sans-serif',
    fontSize:            14,
    fontSizeLG:          16,
    fontSizeSM:          12,
    fontSizeHeading1:    28,
    fontSizeHeading2:    22,
    fontSizeHeading3:    18,
    borderRadius:        4,
    borderRadiusLG:      6,
    borderRadiusSM:      2,
    borderRadiusXS:      2,
    padding:             16,
    paddingLG:           24,
    paddingSM:           8,
    marginLG:            24,
    motionDurationMid:   '0.2s',
    motionDurationSlow:  '0.3s',
    boxShadow:           '0px 8px 24px rgba(7,13,31,0.3)',
    boxShadowSecondary:  '0px 4px 12px rgba(7,13,31,0.2)',
  },
  components: {
    Layout:     { siderBg: '#111827', headerBg: 'rgba(17,24,39,0.7)', bodyBg: '#0c1324', triggerBg: '#1a2235' },
    Menu:       { darkItemBg: '#111827', darkSubMenuItemBg: '#0c1324', darkItemSelectedBg: 'rgba(195,245,255,0.08)', darkItemSelectedColor: '#c3f5ff', darkItemColor: '#9aa5be', darkItemHoverColor: '#e8eaf0', darkItemHoverBg: 'rgba(195,245,255,0.05)', iconSize: 16 },
    Table:      { colorBgContainer: '#111827', headerBg: '#0c1324', rowHoverBg: '#222c42', borderColor: 'transparent', colorTextHeading: '#9aa5be', fontSize: 13 },
    Card:       { colorBgContainer: '#1a2235', paddingLG: 24, borderRadiusLG: 4 },
    Button:     { primaryColor: '#003c4a', defaultBg: 'transparent', defaultBorderColor: 'rgba(195,245,255,0.2)', defaultColor: '#c3f5ff' },
    Input:      { colorBgContainer: '#2e3447', activeBorderColor: '#c3f5ff', hoverBorderColor: 'rgba(195,245,255,0.4)', activeShadow: '0 0 0 2px rgba(195,245,255,0.1)' },
    Select:     { colorBgContainer: '#2e3447', optionSelectedBg: 'rgba(195,245,255,0.08)' },
    Modal:      { contentBg: 'rgba(26,34,53,0.6)', headerBg: 'transparent', footerBg: 'transparent' },
    Drawer:     { colorBgElevated: 'rgba(17,24,39,0.85)' },
    DatePicker: { colorBgContainer: '#2e3447' },
    Badge:      { colorBgContainer: '#c3f5ff', colorText: '#003c4a' },
    Tag:        { defaultBg: 'rgba(195,245,255,0.1)', defaultColor: '#c3f5ff' },
    Statistic:  { titleFontSize: 12, contentFontSize: 28 },
    Tabs:       { inkBarColor: '#c3f5ff', itemSelectedColor: '#c3f5ff', itemHoverColor: '#e8eaf0', itemColor: '#9aa5be' },
    Steps:      { colorPrimary: '#c3f5ff', colorText: '#e8eaf0' },
    Collapse:   { colorBgContainer: '#1a2235', headerBg: '#111827' },
    Timeline:   { colorText: '#e8eaf0', dotBg: '#c3f5ff' },
    Progress:   { defaultColor: '#c3f5ff', trailColor: '#2e3447' },
    Tooltip:    { colorBgSpotlight: '#2e3447', colorTextLightSolid: '#e8eaf0' },
  },
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={nuroxTheme} prefixCls="nurox">
      {children}
    </ConfigProvider>
  )
}
```

### 3.2 Root Layout Integration

```typescript
// apps/web/app/layout.tsx
import { AntdProvider } from '@/components/providers/AntdProvider'
import { ReduxProvider } from '@/components/providers/ReduxProvider'
import { Space_Grotesk, Manrope } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['300','400','500','600','700'] })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','500','600','700','800'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body style={{ background: '#0c1324', fontFamily: 'var(--font-body)' }}>
        <ReduxProvider>
          <AntdProvider>
            {children}
          </AntdProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
```

### 3.3 Global CSS

```css
/* apps/web/app/globals.css */
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Manrope:wght@300..800&display=swap");

:root {
  --color-bg: #0c1324;
  --color-surface-lowest: #070d1f;
  --color-surface-low: #111827;
  --color-surface: #1a2235;
  --color-surface-high: #222c42;
  --color-surface-highest: #2e3447;
  --color-primary: #c3f5ff;
  --color-primary-container: #00e5ff;
  --color-on-primary: #003c4a;
  --color-on-surface: #e8eaf0;
  --color-on-surface-variant: #9aa5be;
  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Manrope", sans-serif;
}

.font-display {
  font-family: var(--font-display);
}
.nurox-modal-content {
  backdrop-filter: blur(20px) !important;
}
.nurox-btn-primary {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-primary-container)
  ) !important;
  border: none !important;
}
.nurox-btn-primary:hover {
  box-shadow: 0 0 8px rgba(195, 245, 255, 0.4) !important;
}
.nurox-table-tbody > tr:nth-child(even) > td {
  background: #070d1f !important;
}
.nurox-table-tbody > tr:nth-child(odd) > td {
  background: #111827 !important;
}
.nurox-table-cell {
  border-bottom: none !important;
}
```

---

## 4. Complete File & Folder Structure

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/[token]/page.tsx
│   │   └── verify-email/[token]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                          # Sider + Header + Content shell
│   │   ├── page.tsx                            # Dashboard home (redirects to /dashboard)
│   │   ├── dashboard/page.tsx
│   │   ├── hr/
│   │   │   ├── employees/
│   │   │   │   ├── page.tsx                    # Employee list
│   │   │   │   ├── new/page.tsx                # New hire wizard
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx                # Employee profile
│   │   │   │       ├── payslips/page.tsx
│   │   │   │       └── performance/page.tsx
│   │   │   ├── departments/page.tsx
│   │   │   ├── positions/page.tsx
│   │   │   └── org-chart/page.tsx
│   │   ├── payroll/
│   │   │   ├── runs/page.tsx
│   │   │   ├── runs/[id]/page.tsx
│   │   │   ├── structures/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── attendance/
│   │   │   ├── records/page.tsx
│   │   │   ├── shifts/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── leave/
│   │   │   ├── requests/page.tsx
│   │   │   ├── balances/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   └── types/page.tsx
│   │   ├── recruitment/
│   │   │   ├── jobs/page.tsx
│   │   │   ├── candidates/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   └── onboarding/[id]/page.tsx
│   │   ├── finance/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── chart-of-accounts/page.tsx
│   │   │   ├── journals/page.tsx
│   │   │   ├── invoices/page.tsx
│   │   │   ├── bills/page.tsx
│   │   │   ├── bank-reconciliation/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── inventory/
│   │   │   ├── products/page.tsx
│   │   │   ├── warehouses/page.tsx
│   │   │   ├── movements/page.tsx
│   │   │   └── valuation/page.tsx
│   │   ├── procurement/
│   │   │   ├── vendors/page.tsx
│   │   │   ├── purchase-orders/page.tsx
│   │   │   ├── grn/page.tsx
│   │   │   └── rfq/page.tsx
│   │   ├── sales/
│   │   │   ├── leads/page.tsx
│   │   │   ├── opportunities/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── analytics/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── board/page.tsx
│   │   │       ├── gantt/page.tsx
│   │   │       └── timesheets/page.tsx
│   │   ├── assets/
│   │   │   ├── register/page.tsx
│   │   │   ├── depreciation/page.tsx
│   │   │   └── maintenance/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── manufacturing/
│   │   │   ├── bom/page.tsx
│   │   │   ├── work-orders/page.tsx
│   │   │   └── production-runs/page.tsx
│   │   ├── logistics/
│   │   │   ├── fleet/page.tsx
│   │   │   ├── routes/page.tsx
│   │   │   └── deliveries/page.tsx
│   │   ├── support/
│   │   │   ├── tickets/page.tsx
│   │   │   └── knowledge-base/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── settings/
│   │       ├── general/page.tsx
│   │       ├── users/page.tsx
│   │       ├── roles/page.tsx
│   │       ├── billing/page.tsx
│   │       ├── integrations/page.tsx
│   │       └── audit-logs/page.tsx
│   ├── api/                                    # Next.js API route handlers (thin proxy only)
│   └── layout.tsx                              # Root layout with providers
├── components/
│   ├── providers/
│   │   ├── AntdProvider.tsx
│   │   ├── ReduxProvider.tsx
│   │   └── SocketProvider.tsx
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── TopBar.tsx
│   │   ├── Sidebar.tsx
│   │   └── BreadcrumbNav.tsx
│   ├── shared/
│   │   ├── StatusTag.tsx
│   │   ├── LogoMark.tsx
│   │   ├── KpiCard.tsx
│   │   ├── PageHeader.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── EmptyState.tsx
│   │   └── CommandPalette.tsx
│   ├── forms/
│   │   ├── RhfInput.tsx
│   │   ├── RhfSelect.tsx
│   │   ├── RhfDatePicker.tsx
│   │   ├── RhfTextArea.tsx
│   │   ├── RhfUpload.tsx
│   │   └── RhfCheckbox.tsx
│   └── tables/
│       ├── DataTable.tsx
│       └── VirtualTable.tsx
├── hooks/
│   ├── usePermission.ts
│   ├── useSocket.ts
│   ├── useTenant.ts
│   ├── useDebounce.ts
│   └── useBreakpoint.ts
├── store/
│   ├── index.ts
│   ├── api/
│   │   ├── baseApi.ts
│   │   ├── hr.api.ts
│   │   ├── payroll.api.ts
│   │   ├── finance.api.ts
│   │   ├── inventory.api.ts
│   │   ├── procurement.api.ts
│   │   ├── sales.api.ts
│   │   ├── projects.api.ts
│   │   └── auth.api.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── uiSlice.ts
│       └── tenantSlice.ts
├── lib/
│   ├── auth.ts
│   ├── api-client.ts
│   ├── antd-message.ts
│   ├── sidebar-items.tsx
│   └── permissions.ts
├── middleware.ts
└── public/

apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── typeorm.config.ts
│   │   ├── redis.config.ts
│   │   ├── minio.config.ts
│   │   └── swagger.config.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── permissions.decorator.ts
│   │   │   ├── tenant.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   └── tenant.guard.ts
│   │   ├── interceptors/
│   │   │   ├── audit-log.interceptor.ts
│   │   │   ├── response-transform.interceptor.ts
│   │   │   └── tenant-scope.interceptor.ts
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts
│   │   └── middleware/
│   │       └── tenant.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── tenants/
│   │   ├── hr/
│   │   ├── payroll/
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── recruitment/
│   │   ├── finance/
│   │   ├── inventory/
│   │   ├── procurement/
│   │   ├── sales/
│   │   ├── projects/
│   │   ├── assets/
│   │   ├── documents/
│   │   ├── notifications/
│   │   ├── audit/
│   │   ├── reports/
│   │   ├── admin/
│   │   ├── billing/
│   │   ├── manufacturing/
│   │   ├── logistics/
│   │   ├── support/
│   │   └── ai/
│   └── database/
│       ├── entities/
│       ├── migrations/
│       └── seeds/
└── test/

packages/shared-schemas/
├── src/
│   ├── auth/
│   ├── hr/
│   ├── payroll/
│   ├── finance/
│   ├── inventory/
│   ├── procurement/
│   ├── sales/
│   ├── projects/
│   └── shared/
└── index.ts
```

---

## 5. Frontend Architecture Patterns

### 5.1 Custom JWT Auth Helpers

```typescript
// apps/web/lib/auth.ts
import {
  loginSchema,
  type LoginDto,
  type AuthResponseDto,
} from "@repo/shared-schemas";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(credentials: LoginDto): Promise<AuthResponseDto> {
  const parsed = loginSchema.parse(credentials);
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(parsed),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }
  return res.json();
}

export async function refreshAccessToken(): Promise<{
  accessToken: string;
  expiresIn: number;
} | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
```

### 5.2 Middleware (Route Protection)

```typescript
// apps/web/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next")
  )
    return NextResponse.next();

  const refreshToken = request.cookies.get("nurox_refresh_token");
  if (!refreshToken?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico|webp)).*)",
  ],
};
```

### 5.3 RTK Query Base API

```typescript
// apps/web/store/api/baseApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { nuroxBaseQuery } from "@/lib/api-client";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: nuroxBaseQuery,
  tagTypes: [
    "Employee",
    "Department",
    "Position",
    "Payroll",
    "PayrollStructure",
    "Leave",
    "LeaveBalance",
    "LeaveType",
    "Attendance",
    "Shift",
    "Candidate",
    "Job",
    "Onboarding",
    "Invoice",
    "Bill",
    "Journal",
    "ChartOfAccount",
    "BankStatement",
    "Product",
    "Warehouse",
    "StockMovement",
    "PurchaseOrder",
    "Vendor",
    "GRN",
    "RFQ",
    "Lead",
    "Opportunity",
    "Customer",
    "SalesOrder",
    "Quotation",
    "Project",
    "Task",
    "Timesheet",
    "Milestone",
    "Asset",
    "Depreciation",
    "Maintenance",
    "Document",
    "Folder",
    "Notification",
    "Announcement",
    "AuditLog",
    "Report",
    "User",
    "Role",
    "Permission",
    "Tenant",
    "Setting",
    "Subscription",
    "Invoice_Billing",
    "Ticket",
    "KnowledgeBase",
    "WorkOrder",
    "BOM",
    "Vehicle",
    "Delivery",
    "Route",
    "TaxRate",
    "TaxReturn",
  ],
  endpoints: () => ({}),
});
```

### 5.4 Fetch Base Query (with token refresh)

```typescript
// apps/web/lib/api-client.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { RootState } from "@/store";
import { setAccessToken, clearAuth } from "@/store/slices/authSlice";
import { refreshAccessToken } from "@/lib/auth";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL + "/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const nuroxBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    const refreshResult = await refreshAccessToken();
    if (refreshResult?.accessToken) {
      api.dispatch(setAccessToken(refreshResult.accessToken));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearAuth());
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }
  return result;
};
```

### 5.5 React Hook Form + Zod + Ant Design Pattern

```typescript
// components/forms/RhfInput.tsx
'use client'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Form, Input, type InputProps } from 'antd'

interface RhfInputProps<T extends FieldValues> extends InputProps {
  control: Control<T>; name: FieldPath<T>; label: string; required?: boolean
}

export function RhfInput<T extends FieldValues>({ control, name, label, required, ...inputProps }: RhfInputProps<T>) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <Form.Item
        label={<span style={{ color: 'var(--color-on-surface-variant)', fontSize: 12, letterSpacing: '0.04em' }}>{label}</span>}
        validateStatus={fieldState.error ? 'error' : ''}
        help={fieldState.error?.message}
        required={required}
        style={{ marginBottom: 20 }}
      >
        <Input {...field} {...inputProps} />
      </Form.Item>
    )} />
  )
}
```

### 5.6 usePermission Hook

```typescript
// apps/web/hooks/usePermission.ts
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export function usePermission(permission: string): boolean {
  const permissions = useSelector(
    (state: RootState) => state.auth.permissions ?? [],
  );
  return permissions.includes(permission);
}
// Usage: const canWrite = usePermission('hr:employees:write')
```

### 5.7 Dashboard Layout

```typescript
// app/(dashboard)/layout.tsx
'use client'
import { Layout, Menu } from 'antd'
import { sidebarItems } from '@/lib/sidebar-items'
import { LogoMark } from '@/components/shared/LogoMark'
import { TopBar } from '@/components/layout/TopBar'

const { Sider, Header, Content } = Layout

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sider width={240} style={{ background: '#111827', position: 'fixed', height: '100vh', left: 0, top: 0, borderRight: '1px solid rgba(61,74,99,0.15)' }} collapsible>
        <div style={{ padding: '20px 16px 12px' }}><LogoMark /></div>
        <Menu theme="dark" mode="inline" items={sidebarItems} style={{ background: 'transparent', border: 'none' }} />
      </Sider>
      <Layout style={{ marginLeft: 240 }}>
        <Header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(61,74,99,0.15)', padding: '0 24px' }}>
          <TopBar />
        </Header>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
```

### 5.8 antd Global Message Instance

```typescript
// apps/web/lib/antd-message.ts
import { message } from "antd";
let messageApi: ReturnType<typeof message.useMessage>[0];
export function setMessageApi(api: ReturnType<typeof message.useMessage>[0]) {
  messageApi = api;
}
export function toast() {
  return {
    success: (content: string) => messageApi?.success(content),
    error: (content: string) => messageApi?.error(content),
    warning: (content: string) => messageApi?.warning(content),
    info: (content: string) => messageApi?.info(content),
  };
}
```

---

## 6. Backend Architecture Patterns

### 6.1 NestJS Main Bootstrap

```typescript
// apps/api/src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix("api/v1");
  app.enableShutdownHooks(); // Graceful shutdown on SIGTERM (K8s)
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = process.env.CORS_ALLOWED_ORIGINS?.split(",") ?? [];
      const pattern = /^https?:\/\/([\w-]+\.)?nurox\.app$/;
      if (!origin || pattern.test(origin) || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("Nurox ERP API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(3001);
}
bootstrap();
```

### 6.2 TypeORM Entity Example

```typescript
// database/entities/employee.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";
import { Department } from "./department.entity";

@Entity("employees")
@Index(["tenantId", "employeeCode"], { unique: true })
export class Employee {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ name: "tenant_id" }) tenantId: string;
  @Column({ name: "employee_code", length: 20 }) employeeCode: string;
  @Column({ name: "first_name", length: 100 }) firstName: string;
  @Column({ name: "last_name", length: 100 }) lastName: string;
  @Column({ unique: true }) email: string;
  @Column({
    name: "employment_type",
    type: "enum",
    enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "PROBATION"],
  })
  employmentType: string;
  @Column({
    name: "status",
    type: "enum",
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "TERMINATED"],
    default: "ACTIVE",
  })
  status: string;
  @ManyToOne(() => Department, (dept) => dept.employees, { nullable: true })
  department: Department;
  @ManyToOne(() => Employee, { nullable: true }) manager: Employee;
  @CreateDateColumn({ name: "created_at" }) createdAt: Date;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt: Date;
  @DeleteDateColumn({ name: "deleted_at" }) deletedAt: Date;
}
```

### 6.3 Shared Zod Schemas

```typescript
// packages/shared-schemas/src/hr/employee.schema.ts
import { z } from "zod";

export const createEmployeeSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  dateOfBirth: z.string().date(),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERN",
    "PROBATION",
  ]),
  departmentId: z.string().uuid(),
  managerId: z.string().uuid().optional(),
  joinDate: z.string().date(),
  salary: z.number().positive().optional(),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export const updateEmployeeSchema = createEmployeeSchema.partial();
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
```

### 6.4 Tenant Middleware

```typescript
// apps/api/src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenant } from "@/database/entities/tenant.entity";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
  ) {}
  async use(req: any, res: any, next: () => void) {
    // Resolve from subdomain (acme.nurox.app) or x-tenant-id header (API clients)
    const host = req.headers["host"] ?? "";
    const subdomain = host.split(".")[0];
    const tenantId =
      req.headers["x-tenant-id"] ??
      (await this.tenantRepo
        .findOne({ where: { subdomain } })
        .then((t) => t?.id));
    if (!tenantId) throw new NotFoundException("Tenant not found");
    req.tenantId = tenantId;
    next();
  }
}
```

### 6.5 Audit Log Interceptor

```typescript
// apps/api/src/common/interceptors/audit-log.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "@/database/entities/audit-log.entity";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = req;
    const start = Date.now();
    return next.handle().pipe(
      tap(async (data) => {
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
          await this.auditRepo.save({
            tenantId: req.tenantId,
            actorId: user?.id,
            action: method,
            entityType: context
              .getClass()
              .name.replace("Controller", "")
              .toLowerCase(),
            entityId: data?.id ?? req.params?.id,
            ipAddress: ip,
            userAgent: headers["user-agent"],
            newValue: method !== "DELETE" ? data : null,
            durationMs: Date.now() - start,
          });
        }
      }),
    );
  }
}
```

### 6.6 Caching Strategy

- **L1 (In-memory):** NestJS `CacheModule` with TTL for hot config (tenant settings, feature flags, permission matrices)
- **L2 (Redis):** Session store, rate limits, feature flags, BullMQ job state
- **Cache invalidation:** Event-driven — entity writes emit via `@nestjs/event-emitter` → clear relevant Redis keys
- **Cache warming:** On API boot, pre-load active tenant configs and permission matrices
- **No-cache endpoints:** Auth, write operations, real-time WebSocket data
- **RTK Query cache:** Tag-based invalidation on mutations; optimistic updates for UX

### 6.7 Pagination Standard

- All list endpoints support offset-based pagination: `?page=1&limit=25` (antd Table compatible)
- Cursor-based pagination available for real-time feeds: `?cursor=abc&limit=25`
- Max page size: 100 records per request (enforced in Zod DTO)
- Response shape: `{ data: T[], meta: { total, page, limit, totalPages } }`
- For large exports (>10k rows): use streaming CSV via NestJS `StreamableFile` (no pagination)

### 6.8 Database Connection Config

- TypeORM pool: `max: 20` connections per pod (behind PgBouncer in production)
- PgBouncer: `transaction` mode — per-query connection borrowing
- Connection timeout: `5000ms`; idle timeout: `30000ms`; query timeout: `30000ms`
- Read replica support: optional `replication` config for read-heavy analytics queries
- PostgreSQL version: 18 with `postgres:18-alpine` Docker image

### 6.9 Graceful Shutdown

- `app.enableShutdownHooks()` — NestJS drains active requests on SIGTERM
- K8s `terminationGracePeriodSeconds: 30` — pods get 30s to finish in-flight work
- Close DB connections, Redis clients, and BullMQ workers on shutdown
- Health endpoint returns `503` during drain phase — K8s stops routing new traffic

---

## 7. SaaS Infrastructure & Multi-Tenancy

### 7.1 Tenancy Model

- **Strategy (Default):** Row-level multi-tenancy — all tables include `tenant_id UUID NOT NULL`
- **Strategy (Enterprise Tier):** Optional PostgreSQL schema-per-tenant for regulatory data isolation compliance
- **Decision Rule:** Starter/Growth/Business plans use row-level (simpler ops, lower cost). Enterprise tier can opt into schema-per-tenant.
- **Tenant Resolution:** `TenantMiddleware` resolves from subdomain (`acme.nurox.app`) or `x-tenant-id` header
- **Data Isolation:** All service methods scoped with `WHERE tenant_id = :tenantId` — enforced via TypeORM query scoping
- **Wildcard DNS:** `*.nurox.app` → Cloudflare → Nginx → Next.js (subdomain injected as tenant context)
- **Custom Domains:** CNAME mapping (`erp.acme.com` → `nurox.app`) — stored in `tenant_custom_domains` table
- **DNS Validation:** Custom domain verified via DNS TXT record before activation

### 7.2 Tenant Provisioning Workflow

```typescript
// When a new tenant signs up:
// 1. Create tenant record → assign subdomain slug
// 2. Seed default roles: SUPER_ADMIN, ADMIN, HR_MANAGER, MANAGER, EMPLOYEE, VIEWER
// 3. Seed default permission nodes for all modules
// 4. Seed default chart of accounts (country-specific template)
// 5. Seed default leave types (Annual, Sick, Casual, Public)
// 6. Seed default payroll structures (Basic, HRA, Transport, Medical)
// 7. Create owner user → send welcome email with credentials
// 8. Assign SUPER_ADMIN role to owner
// 9. Create default fiscal year (current calendar year)
// 10. Create default currency (based on country selection)
// 11. Enable modules per subscription plan
// 12. Initialize tenant_settings with defaults
```

### 7.3 Module Enable/Disable per Tenant

```sql
-- tenant_modules table
CREATE TABLE tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  module_key VARCHAR(50) NOT NULL,  -- 'hr', 'payroll', 'finance', 'inventory', etc.
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  UNIQUE(tenant_id, module_key)
);
```

### 7.4 Subscription Plans

| Plan       | Modules                                         | Users     | Storage | Price/mo |
| ---------- | ----------------------------------------------- | --------- | ------- | -------- |
| Starter    | HR + Payroll + Attendance                       | 25        | 5 GB    | $49      |
| Growth     | + Finance + Inventory + Procurement + Sales     | 100       | 25 GB   | $149     |
| Business   | + Projects + Assets + Manufacturing + Logistics | 500       | 100 GB  | $399     |
| Enterprise | All 30 modules + custom integrations            | Unlimited | 1 TB    | Custom   |

### 7.5 Feature Flag Service

```typescript
// apps/api/src/modules/admin/feature-flags.service.ts
// Redis-backed feature flags with DB fallback
// Flags checked on every request via guard or middleware
// Admin UI in Settings → Feature Flags to toggle per tenant
// Example flags: 'ai_suggestions', 'advanced_reports', 'pos_integration', 'mobile_biometric'
```

---

### 7.6 Development Priority Phases

| Phase                      | Modules                                       | Timeline    | Business Value                        |
| -------------------------- | --------------------------------------------- | ----------- | ------------------------------------- |
| **Phase 1 — MVP**          | Auth, Users, HR, Attendance, Leave, Dashboard | Month 1-4   | Core HR SaaS — first paying customers |
| **Phase 2 — Finance**      | Payroll, Finance, Reporting, Notifications    | Month 5-8   | Complete HR+Payroll+Finance           |
| **Phase 3 — Supply Chain** | Inventory, Procurement, Sales/CRM             | Month 9-12  | Manufacturing/trading company support |
| **Phase 4 — Advanced**     | Projects, Assets, Documents, Manufacturing    | Month 13-16 | Enterprise feature completeness       |
| **Phase 5 — Scale**        | SaaS Billing, AI, POS, Logistics, Mobile      | Month 17-20 | Revenue expansion, mobile, AI         |
| **Phase 6 — Hardening**    | Security, DevOps, Compliance, Support         | Ongoing     | Production hardening, compliance      |

---

## 8. Feature Modules (1–30)

---

### Module 1: Core Platform & Infrastructure

- [ ] Row-level tenant isolation as default — all queries scoped by `tenant_id` column
- [ ] Optional schema-per-tenant isolation for Enterprise tier (via `SET search_path`)
- [ ] `TenantMiddleware` resolves `tenantId` from subdomain (`acme.nurox.app`) or `x-tenant-id` header
- [ ] All service layer queries scoped by `tenantId` field — no cross-tenant data leakage possible
- [ ] Custom subdomain routing in middleware.ts — `acme.nurox.app` → inject `x-tenant-id`
- [ ] Custom domain support — CNAME mapping stored in `tenant_custom_domains`, validated via DNS TXT record
- [ ] Tenant provisioning workflow with default roles, permissions, chart of accounts, leave types, and fiscal year seed
- [ ] Tenant feature toggle in `tenant_modules` table — enable/disable modules per plan
- [ ] Tenant module-level access guard — returns 403 with upgrade prompt if module disabled
- [ ] `next-intl` with locale in URL segment: `/en/`, `/bn/` (Bengali), `/ar/` (Arabic RTL), `/zh/` (Chinese)
- [ ] RTL layout support — CSS logical properties + `direction: rtl` on `<html>` for Arabic
- [ ] Light / Dark mode — antd `algorithm` toggle between `darkAlgorithm` / `defaultAlgorithm`; persisted in user preferences
- [ ] Tenant branding — logo + primary color override injected into antd `ConfigProvider` per session
- [ ] Fully responsive layout using antd Grid + Tailwind breakpoints (mobile ≥ 320px, tablet ≥ 768px, desktop ≥ 1280px)
- [ ] WCAG 2.1 AA — antd components ARIA-accessible; verify focus rings, keyboard nav, and color contrast ≥ 4.5:1
- [ ] Skeleton loaders using antd `Skeleton` on all RTK Query `isLoading` states
- [ ] Global error boundary — React `ErrorBoundary` wrapping every route segment; shows fallback with retry
- [ ] Global command palette (⌘K) using `cmdk` — searches employees, invoices, products, tasks, settings
- [ ] Breadcrumbs via antd `Breadcrumb` — auto-generated from Next.js App Router segment config
- [ ] Floating action button `antd FloatButton.Group` — context-sensitive quick actions per module
- [ ] Global keyboard shortcuts — defined per module (e.g., `N` = New, `F` = Filter, `E` = Export)
- [ ] Connection status indicator — socket health badge in TopBar
- [ ] Offline support — RTK Query cache persistence to localStorage; offline banner when disconnected
- [ ] System health dashboard — DB pool, Redis memory, queue depths, active WebSocket connections
- [ ] Rate limiting displayed to user — `429` response shows retry-after countdown in UI
- [ ] Maintenance mode — Redis flag → NestJS settings endpoint → middleware returns `503` with ETA
- [ ] Print styles — `@media print` CSS for all report/invoice/payslip pages
- [ ] PostHog analytics — track feature usage, page views, and key action funnels per tenant

---

### Module 2: Authentication & Authorization

- [ ] `lib/auth.ts` — Custom JWT helpers: `login`, `refresh`, `logout`, `verifyEmail`, `forgotPassword`, `resetPassword`
- [ ] `AuthSlice` — stores `accessToken` (memory), `user`, `permissions`, `tenantId` in Redux
- [ ] `NestJS`: `POST /api/v1/auth/login` → returns `accessToken` (15 min, RS256) + sets httpOnly `nurox_refresh_token` cookie (7 days)
- [ ] Silent token refresh — `nuroxBaseQuery` intercepts `401`, calls `POST /api/v1/auth/refresh`, retries original request
- [ ] Refresh token rotation — new token on every refresh; family reuse detection triggers full session invalidation
- [ ] `POST /api/v1/auth/logout` — invalidates refresh token in Redis, clears cookie
- [ ] OAuth 2.0: Google + Microsoft (Azure AD) via NestJS Passport strategies (`passport-google-oauth20`, `passport-azure-ad`)
- [ ] SAML 2.0 SSO — enterprise tier via `passport-saml` + IdP metadata management in tenant settings
- [ ] TOTP 2FA — `speakeasy` QR enrollment + 6-digit verify on NestJS; TOTP secret stored AES-encrypted
- [ ] 2FA backup codes — 10 single-use codes, bcrypt-hashed, revocable
- [ ] SMS OTP — 6-digit code via Twilio / SSLCOMMERZ, 5 min expiry, Redis TTL
- [ ] Passwordless magic link — 10 min JWT via email; one-time use, invalidated after click
- [ ] Forgot/reset password — signed link (15 min expiry, invalidated after use), `POST /api/v1/auth/reset-password`
- [ ] Email verification — new users must verify email; resend endpoint with 60s cooldown
- [ ] Active session list — device fingerprint + IP + browser + last active; `DELETE /api/v1/auth/sessions/:id` to revoke
- [ ] Account lockout — 5 failed attempts / 15 min per IP + per account — Redis TTL-backed; admin unlock endpoint
- [ ] System roles: `SUPER_ADMIN`, `ADMIN`, `HR_MANAGER`, `FINANCE_MANAGER`, `MANAGER`, `EMPLOYEE`, `VIEWER`, `AUDITOR`
- [ ] Custom role builder — permission nodes per module (e.g., `hr:employees:write`), saved to `roles` table
- [ ] Permission inheritance — roles can inherit from a parent role; child role cannot exceed parent permissions
- [ ] `@Permissions('hr:employees:write')` decorator + `PermissionsGuard` on every NestJS endpoint
- [ ] middleware.ts route protection — unauthenticated → redirect to `/login?callbackUrl=...`
- [ ] `usePermission(permission)` hook reads from Redux auth slice; memoized
- [ ] Conditional UI rendering via `usePermission` — hide/show buttons, table columns, menu items per role
- [ ] IP allowlist per tenant — optional; blocks logins from non-whitelisted IPs (configurable in tenant settings)
- [ ] Force password change flag — `must_change_password` field on user; enforced on next login
- [ ] Password strength meter — real-time Zod-driven feedback in password fields
- [ ] Login activity log — `login_events` table with geo, device, result; displayed in My Account → Security
- [ ] Refresh token stored in Redis: `refresh:{tokenHash}` → `{userId, family, generation}` with TTL
- [ ] On each refresh: increment generation; if old generation reused → delete entire family → force re-login
- [ ] Token hash: SHA-256 (never store raw refresh token in Redis)
- [ ] Max concurrent sessions: configurable per tenant (default: 5 per user); auto-revoke oldest on exceed
- [ ] Admin can view and terminate any user's active sessions from admin panel

---

### Module 3: User & Organization Management

- [ ] User CRUD with antd Form + RHF — create, edit, deactivate, delete with soft-delete
- [ ] Profile photo upload — antd Upload → NestJS pre-signed MinIO URL → direct S3 PUT; auto-resize to 256×256
- [ ] Bulk user CSV import — antd Upload → row-by-row Zod validation → error report with row numbers in antd Table
- [ ] User statuses: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING_INVITE` — antd `StatusTag`
- [ ] Invite-by-email — signed one-time token link (48h expiry); resend endpoint with 24h cooldown
- [ ] Force password change flag on first login
- [ ] User preferences — theme (dark/light), language, timezone, date format, notification settings
- [ ] Company profile — logo, legal name, trade name, registration number, address, tax ID, currency, timezone
- [ ] Multi-branch — branch entity with address, timezone, manager; all HR/Payroll/Inventory scoped per branch
- [ ] Department CRUD — parent department (TypeORM closure table → recursive antd `TreeSelect`)
- [ ] Position / Job Title master — linked to department; used in offers, job postings, salary bands
- [ ] Grade / Band system — compensation bands per grade; linked to positions
- [ ] Visual org chart — `react-d3-tree` styled to Deep Space palette; interactive expand/collapse; export as PNG
- [ ] Cost center assignment — per department; linked to finance GL accounts for auto-posting
- [ ] Reporting line visualization — employee card shows manager and direct reports
- [ ] Team directory — searchable employee list with photo, department, extension, availability badge
- [ ] Employee self-service portal — view profile, payslips, leave balance, payslips, update personal details (with approval)
- [ ] Personal detail change workflow — employee submits update → HR approves → auto-applied
- [ ] Emergency contacts — multiple contacts per employee with relationship type
- [ ] Skills & certifications catalog — global catalog + per-employee skill matrix with proficiency level and expiry
- [ ] Working calendar — global and branch-level; public holidays, working days, half-day rules

---

### Module 4: Dashboard & Analytics

- [ ] Personalized widget layout — `@dnd-kit/core` drag-and-drop reorder per user
- [ ] Widget preferences persisted to `user_dashboard_widgets` table — restored on login
- [ ] Widget library — 20+ pre-built widgets: Headcount, Payroll Cost, Revenue, Expenses, Open POs, Overdue Invoices, Leave Today, Attendance Rate, Pipeline Value, Task Completion, Stock Alerts, New Hires, etc.
- [ ] KPI cards — antd `Statistic` with Space Grotesk + Electric Cyan accent; trend indicator (% vs last period)
- [ ] Real-time KPI updates via Socket.io subscription — configurable refresh interval
- [ ] Date range filter — antd `RangePicker` with presets: Today, This Week, This Month, This Quarter, This Year, Custom
- [ ] Recharts charts themed to Deep Space — Bar, Line, Stacked Bar, Area, Pie, Donut, Scatter, Radar
- [ ] Drill-down charts — click chart segment to filter underlying data table
- [ ] Department comparison — side-by-side KPIs per department
- [ ] Quick action button — antd `FloatButton.Group` with role-filtered shortcuts
- [ ] Recent activity feed — `audit_logs` last 50 items with actor avatar + description
- [ ] Alerts panel — RTK Query polling `/alerts` every 60 seconds; categorized by severity
- [ ] Announcement banner — admin broadcasts shown at top of dashboard; dismissible per user
- [ ] My Tasks widget — upcoming tasks from Projects module
- [ ] My Approvals widget — pending approval requests from all modules (Leave, Payroll, PO, etc.)
- [ ] RSC shell + Client Component widgets — Server components render layout; client components handle real-time
- [ ] Executive dashboard — separate high-level view for CEO/CFO with consolidated P&L, headcount, revenue
- [ ] Department manager dashboard — scoped to manager's team only
- [ ] Comparison mode — current period vs. previous period side-by-side

---

### Module 5: Human Resources

- [ ] New hire multi-step wizard — antd `Steps` + `Form`, Zod schema per step: Personal → Employment → Compensation → Emergency → Documents
- [ ] Employment types: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERN`, `PROBATION`
- [ ] Probation period tracking — configurable duration per employment type; BullMQ job triggers notification 14/7/1 day before expiry
- [ ] Probation extension workflow — manager request → HR approval → updated probation end date
- [ ] Contract file upload — antd Upload → MinIO; expiry reminder cron via BullMQ (90/30/7 days)
- [ ] Employment history timeline — antd `Timeline`; joins, transfers, promotions, title changes
- [ ] Salary revision history with effective date — linked to payroll structures
- [ ] Increment/promotion approval workflow — DRAFT → SUBMITTED → APPROVED → APPLIED
- [ ] Promotion wizard — new position, grade, salary, effective date; triggers org chart update
- [ ] Transfer workflow — from branch/department to another; approval required; updates reporting line
- [ ] Termination workflow — reason code, last working day, clearance checklist, final settlement trigger
- [ ] Resignation workflow — employee submits → manager acknowledges → HR processes; exit interview scheduled
- [ ] Exit interview form — antd Form + RHF; answers stored for HR analytics
- [ ] Clearance checklist — asset return, system access revoke, knowledge transfer, final payroll
- [ ] Re-hiring — link to previous employment record; skip re-onboarding for returning employees
- [ ] OKR goal setting — objective + key results with progress %; cascaded from company → department → individual
- [ ] OKR check-in — weekly/monthly progress update with comment; history graph via Recharts
- [ ] 360° review cycle — configurable frequency; self, peer, subordinate, manager ratings; anonymized
- [ ] Performance calibration — HR view comparing all employees' ratings; bell curve distribution chart
- [ ] PIP workflow — documented targets, review dates, progress notes; escalation triggers
- [ ] Performance improvement letter generator — Puppeteer PDF from Handlebars template
- [ ] Training catalog — course library with category, provider, duration, cost, link/attachment
- [ ] Training enrollment — employee self-enroll or HR-assign; approval optional; BullMQ reminder before start
- [ ] Training completion tracking — mark complete, upload certificate; skill auto-linked
- [ ] Training certificate PDF via Puppeteer — company letterhead + employee name + course name + date
- [ ] Skill matrix — grid view: employees × skills with proficiency levels; gap analysis
- [ ] Succession planning — identify successor candidates per key position; readiness rating
- [ ] HR analytics dashboard — headcount trend, turnover rate, average tenure, gender diversity, department distribution
- [ ] Employee NPS (eNPS) survey — anonymous quarterly pulse; results aggregated by department
- [ ] Birthday and work anniversary notifications — auto-sent to team via notification system
- [ ] Employee handbook builder — Tiptap rich text; versioned; employees acknowledge via e-signature

---

### Module 6: Payroll Management

- [ ] Salary structure builder — components: Basic, HRA, Transport, Medical, Special Allowance, deductions (PF, Tax, Advance, Penalty)
- [ ] Multiple salary structures per tenant — assigned per employee or grade
- [ ] Payroll run lifecycle: `DRAFT` → `REVIEW` → `APPROVED` → `PROCESSING` → `PROCESSED` → `PAID`
- [ ] Bulk payroll run for all active employees or filtered subset (branch, department, grade)
- [ ] Individual off-cycle payroll — for new joiners, resignees, or corrections
- [ ] Gross / Net auto-computation — `payroll-compute.service.ts` with formula engine per component
- [ ] Tax bracket configuration per fiscal year — BD TIN compliant; configurable slabs + rebate
- [ ] Tax calculation: progressive slab computation, investment rebate, annual tax projection
- [ ] 🇧🇩 BEFTN bank file export — tab-delimited per Bangladesh Bank standard; bank-wise split
- [ ] PF contribution computation — employee + employer %; optional Gratuity calculation
- [ ] Overtime hours pulled from `attendance_records`; configurable overtime multiplier (1x, 1.5x, 2x)
- [ ] Overtime approval workflow — manager approves overtime before payroll computation
- [ ] Bonus / incentive as separate payroll run component — festival bonus, performance bonus, commission
- [ ] Arrear calculation — backdated salary revisions auto-compute arrear in current run
- [ ] Loan & advance management — employee loan, deduction schedule, outstanding balance tracking
- [ ] Advance salary request workflow — employee request → manager → HR → Finance; deducted from payroll
- [ ] Salary on-hold flag — prevent payroll processing for employees under investigation
- [ ] Payslip PDF via Puppeteer — company letterhead template; company logo, employee details, component breakdown, YTD
- [ ] Employee self-service payslip download — RTK Query + MinIO presigned URL; last 24 months
- [ ] Payslip email distribution — BullMQ bulk email queue on payroll `PROCESSED` status
- [ ] Bank letter PDF — individual payment advice letter per employee for record
- [ ] Payroll summary report — department-wise totals, cost center allocation
- [ ] Payroll journal auto-posting — debit Salary Expense GL accounts; credit Payable GL on `APPROVED`
- [ ] Payroll comparison report — month-over-month variance per component per employee
- [ ] Full payroll audit trail — every compute, edit, and approval logged with `before/after` values
- [ ] Salary bank transfer file — per-bank CSV/TXT per RD/RTGS format; downloadable from processed run
- [ ] Multi-currency payroll — expat employees paid in different currency; auto-converted at run-date rate

---

### Module 7: Attendance & Leave

**Attendance**

- [ ] Manual HR entry — daily or bulk; editable by HR with mandatory reason
- [ ] Bulk CSV import — upload daily attendance from external systems; Zod validation + error report
- [ ] QR code check-in — JWT-signed QR regenerated every 30 minutes → NestJS verify → `attendance_records`; employee scans on mobile
- [ ] QR kiosk mode — tablet-friendly full-screen check-in interface for office entrance
- [ ] ZKTeco biometric bridge — Node.js TCP client polls ZKTeco device, syncs punch data to DB via queue
- [ ] Geo-fenced check-in — HTML5 Geolocation API → NestJS radius validation using `haversine` formula; configurable radius per branch
- [ ] IP-based check-in validation — allow check-in only from office IP range (optional)
- [ ] Shift management: `MORNING`, `EVENING`, `NIGHT`, `ROTATING`, `FLEXIBLE`
- [ ] Shift assignment — per employee or batch; shift calendar view
- [ ] Flexible shift rules — grace period, early departure allowance, break time deduction
- [ ] Rotating shift scheduler — auto-assign shifts per rotation pattern; weekly/monthly
- [ ] Late/early mark auto-computation — compare punch vs shift time; generates late/early records
- [ ] Overtime auto-flag — clock-out exceeds shift end by configurable minutes; requires manager approval
- [ ] Half-day logic — configurable half-day cut-off time; reduces leave balance by 0.5
- [ ] Regularization request — employee submits missing punch reason → manager approval → record corrected
- [ ] Monthly attendance report — antd Table + ExcelJS export; summary + detailed views
- [ ] Attendance analytics — absenteeism rate, late arrival trend, overtime cost by department

**Leave**

- [ ] Leave type configuration — Annual, Sick, Casual, Maternity, Paternity, Unpaid, Compensatory, Study Leave, Bereavement
- [ ] Leave balance per employee per fiscal year — `leave_balances` table; real-time deduction
- [ ] Pro-rated balance for new joiners — based on join date within fiscal year
- [ ] Carry-forward rules — max days, expiry date, auto-lapse via BullMQ cron at year-end
- [ ] Leave application portal — employee applies with dates, type, reason, optional attachment
- [ ] Multi-level approval workflow — employee → direct manager → HR; configurable per leave type
- [ ] Delegation — manager auto-escalates approvals to backup manager when on leave
- [ ] Team calendar view — antd `Calendar` with custom cell render showing who is on leave by day
- [ ] Clash detection — alerts when too many team members apply leave for same dates; configurable threshold
- [ ] Public holiday table — per branch/country; linked to attendance and leave calculation
- [ ] Leave encashment calculation — encashable leave types with cap; computed in payroll run
- [ ] Leave without pay (LWP) — auto-deducts from salary in payroll run
- [ ] Compensatory off — grant comp-off for overtime/weekend work; with expiry
- [ ] Leave cancellation — with reason; manager re-approval required if already approved
- [ ] Leave balance report — all employees' balance summary + transaction history
- [ ] Leave audit trail — all applications, approvals, cancellations logged

---

### Module 8: Recruitment & Onboarding

**Recruitment**

- [ ] Job requisition — raise hiring request; approval: manager → HR → Finance (headcount budget check)
- [ ] Job posting builder — Tiptap rich text description; requirements, responsibilities, compensation range
- [ ] Multi-channel publish — post to job boards via webhook (LinkedIn, Indeed, Bdjobs, Glassdoor)
- [ ] Career portal page — public-facing job listings at `careers.{tenant}.nurox.app`; built with Next.js ISR
- [ ] Application form builder — customizable per job; drag-and-drop field builder
- [ ] Resume/CV upload — antd Upload → MinIO; parsed via AI (skill extraction, experience summary)
- [ ] ATS Kanban board — `@dnd-kit` columns: `Applied` → `Screened` → `Phone Screen` → `Interview 1` → `Interview 2` → `Technical Test` → `Offer` → `Hired` / `Rejected`
- [ ] Candidate profile — full timeline of all interactions, status changes, feedback
- [ ] Duplicate candidate detection — email + phone dedup check on application submit
- [ ] Resume parsing — OpenAI-powered extraction of name, email, skills, experience, education
- [ ] AI candidate scoring — rank applicants by job fit score using job description + resume match
- [ ] Interview scheduling — antd `DatePicker`; interviewer calendar conflict check; Google Calendar event creation
- [ ] Interview panel management — multi-interviewer assignment per round
- [ ] Interview feedback form — RHF + Zod + antd Form; scorecard with configurable dimensions
- [ ] Offer letter generation — Puppeteer from Handlebars template; variables: name, position, salary, join date
- [ ] Digital offer acceptance — candidate e-signs via HTML5 canvas; stored in MinIO
- [ ] Offer expiry — auto-expire after configurable days; BullMQ reminder to recruiter
- [ ] Rejection email automation — BullMQ `email` queue; configurable templates per rejection stage
- [ ] Referral tracking — employee referral source linked to hired candidates; referral bonus automation
- [ ] Recruitment analytics — time-to-hire, source-of-hire, funnel conversion rates, interviewer load

**Onboarding**

- [ ] Onboarding checklist builder — HR defines templates per employment type; tasks with due dates and owners
- [ ] Digital document collection portal — NID, TIN, bank details, academic certificates → MinIO via antd Upload
- [ ] Document verification workflow — HR marks each document verified; checklist completion gates account creation
- [ ] E-signature for employment contract — HTML5 Canvas → PNG → overlaid on PDF via Puppeteer
- [ ] Equipment provisioning checklist — linked to Asset module; laptop, phone, badge issued
- [ ] IT access provisioning — checklist items; auto-sends credential emails on checklist completion
- [ ] Buddy assignment — pair new hire with onboarding buddy; buddy notified
- [ ] Day-1 welcome email — automated via BullMQ; includes schedule, contacts, and handbook link
- [ ] 30/60/90 day milestone check-ins — scheduled tasks for manager with feedback form
- [ ] Onboarding completion — auto-triggers: user activation, payroll enrollment, leave balance initialization

---

### Module 9: Finance & Accounting

- [ ] Hierarchical Chart of Accounts — TypeORM adjacency list → antd Tree; account types: Asset, Liability, Equity, Revenue, Expense
- [ ] Country-specific CoA templates — BD, IN, US, UK; seeded on tenant provision
- [ ] Multi-currency — base currency per tenant; live exchange rates via fixer.io API
- [ ] Currency revaluation — batch revalue foreign-currency balances at period-end rate
- [ ] Manual journal entry — RHF multi-line debit/credit; Zod `.refine()` balance check; Tiptap narration
- [ ] Double-entry enforcement — `sum(debits) === sum(credits)` at service level; cannot post unbalanced entry
- [ ] Auto journals — triggered from Payroll (salary expense), Sales Invoice (AR debit), Vendor Bill (AP credit), Asset Depreciation (expense debit), Stock Valuation (COGS)
- [ ] Journal approval workflow — preparer → reviewer → approver; multi-level configurable
- [ ] Recurring journal — fixed or formula-based; scheduled via BullMQ cron
- [ ] General ledger drill-down — antd Table with lazy loading; click account → transaction list → click transaction → journal entry
- [ ] Trial balance — as of any date; comparative periods; export PDF/XLSX
- [ ] Period closing — soft-lock on `accounting_periods`; prevents backdated entries; reopen with approval
- [ ] Customer invoice lifecycle: `DRAFT` → `SENT` → `PARTIALLY_PAID` → `PAID` → `OVERDUE` → `VOID`
- [ ] Invoice template builder — logo, header, footer, payment terms, bank details; PDF via Puppeteer
- [ ] Proforma invoice — convert to final invoice on customer confirmation
- [ ] Recurring invoice — subscription billing; auto-generated on schedule
- [ ] Credit note — partial or full reversal; linked to original invoice
- [ ] Automated AR reminder emails — 7/3/1 day before due; overdue escalation; via BullMQ
- [ ] AR aging report — 0-30, 31-60, 61-90, 90+ day buckets; drill-down to invoice level
- [ ] Vendor bill management — three-way matching: PO × GRN × Bill; mismatch alert with diff view
- [ ] AP aging report — outstanding bills by vendor; payment priority suggestion
- [ ] Expense claim — employee submits with receipt photo; multi-level approval; reimburse via payroll or direct payment
- [ ] Petty cash management — opening balance, disbursements, replenishment; running balance
- [ ] Bank account management — multiple accounts; opening balance; statement upload
- [ ] Bank statement import — CSV / OFX / MT940; auto-match transactions via fuzzy amount + date matching
- [ ] Bank reconciliation — matched/unmatched view; manual match/unmatch; reconciliation report
- [ ] Payment processing — record payment against invoice/bill; partial payment support; allocation
- [ ] Payment batch — bulk pay multiple bills in one batch; bank file export
- [ ] VAT / GST configuration — rate library per country; applied on invoice lines
- [ ] Tax invoice vs. non-tax invoice toggle
- [ ] VAT return computation — input vs. output tax; return form PDF
- [ ] TDS / WHT computation and challan export
- [ ] Income Statement (P&L) — monthly / quarterly / annual; department filter; budget vs actual
- [ ] Balance Sheet — as of any date; comparative periods
- [ ] Cash Flow Statement — direct and indirect method
- [ ] Budget module — set budget per GL account per period; variance report
- [ ] Cost center reporting — P&L per cost center
- [ ] All financial reports — PDF (Puppeteer) + XLSX (ExcelJS) + CSV streaming export

---

### Module 10: Inventory Management

- [ ] Multi-warehouse hierarchy — warehouse → zone → rack → bin
- [ ] Product catalog — SKU, barcode, UOM, UOM conversion, category tree, tax class, MinIO images, description
- [ ] Product variants — size / color / batch / grade; each variant has independent stock
- [ ] Bill of Materials (BOM) — multi-level BOM for manufactured products; linked to Manufacturing module
- [ ] Unit of Measure groups — e.g., Box (12 pcs); auto-convert on transactions
- [ ] Stock receipt (GRN) — from PO or standalone; bin-level putaway
- [ ] Stock issue — for production orders, internal consumption, or sales delivery
- [ ] Inter-warehouse transfer — initiate transfer → transit state → confirm receipt at destination
- [ ] Stock adjustment — mandatory reason code; auto-journal to Inventory Adjustment GL account
- [ ] Negative stock prevention — configurable per product; warning or hard block
- [ ] FIFO / LIFO / Weighted Average valuation — configurable per product category; consistent per tenant
- [ ] Reorder point alerts — BullMQ daily check; generates suggested purchase order draft
- [ ] Minimum/maximum stock level configuration per product per warehouse
- [ ] Batch / lot tracking — assign batch number on receipt; track through all movements
- [ ] Serial number tracking — individual unit-level traceability; scan-in / scan-out
- [ ] Expiry date tracking — FEFO dispatch suggestion; BullMQ alerts for near-expiry stock
- [ ] Quarantine bin — isolate damaged/rejected stock; separate from available stock
- [ ] Physical stock count — count sheet generation → count entry → variance report → adjustment posting
- [ ] Cycle counting — rolling count schedule; high-value/fast-moving items counted more frequently
- [ ] Inventory aging analysis — stock held > 30/60/90/180 days; write-off suggestion
- [ ] Stock valuation report — current stock × average cost per product; balance sheet-ready
- [ ] Goods return to vendor — return stock to vendor; auto-deduct from inventory; links to debit note
- [ ] Consignment stock — track vendor-owned stock separately
- [ ] Barcode label printing — generate and print barcodes via ZPL or PDF for thermal printers

---

### Module 11: Procurement & Purchase

- [ ] Vendor master — company info, contact persons, KYC documents, payment terms, currency, credit limit, bank details
- [ ] Vendor categories — preferred, blacklisted, approved; approval workflow to add new vendors
- [ ] Vendor portal — self-service login for vendors to view POs, submit invoices, check payment status
- [ ] Purchase Requisition (PR) → Request for Quotation (RFQ) → Purchase Order (PO) → GRN workflow
- [ ] PR approval chain — employee → manager → department head → procurement; configurable per amount
- [ ] Multi-vendor RFQ — send RFQ to multiple vendors; receive and compare quotations side-by-side
- [ ] Auto-comparison table — best price, best delivery, best quality score per vendor
- [ ] PO creation from approved PR or direct; line items with quantity, rate, tax, delivery date
- [ ] PO PDF emailed to vendor — Puppeteer + Nodemailer; vendor copy stored in MinIO
- [ ] PO amendment with version history — each amendment creates new version; vendor notified
- [ ] PO cancellation workflow with reason; partial cancellation support
- [ ] GRN (Goods Receipt Note) — partial and full receipt; bin-level putaway; auto-updates inventory
- [ ] GRN inspection — quality check step; mark accepted/rejected quantities
- [ ] 3-way matching — PO quantity × GRN quantity × Vendor Bill amount; mismatch alert with diff
- [ ] Vendor credit limit check at PO creation; soft warning or hard block
- [ ] Purchase return → Debit Note → inventory adjustment
- [ ] Landed cost allocation — add freight, duties, insurance to received items; updates average cost
- [ ] Vendor payment terms — net 30, net 60, advance %, milestone-based
- [ ] Vendor evaluation scorecard — delivery performance, quality, pricing, responsiveness (manual scoring)
- [ ] Spend analytics — vendor spend over time, category spend, budget vs actual procurement; Recharts
- [ ] Procurement approval matrix — defined by amount and category in `approval_matrices` table

---

### Module 12: Sales & CRM

- [ ] Lead capture — manual entry, public web form, inbound email parser, webhook from marketing tools
- [ ] Lead source tracking — website, referral, cold outreach, ad campaign, social media
- [ ] Lead scoring — configurable point weights per attribute (company size, industry, engagement); auto-computed
- [ ] Lead assignment rules — round-robin or territory-based; auto-assign to sales rep
- [ ] Opportunity pipeline — `@dnd-kit` Kanban + antd Table list view; configurable stages per tenant
- [ ] Win probability by stage — configurable expected close %; weighted pipeline value dashboard
- [ ] Contact management — individuals linked to company accounts; relationship type, communication history
- [ ] Company account management — linked contacts, linked deals, revenue history, documents
- [ ] Activity log — calls, emails, meetings, notes, tasks; timeline view per lead/contact/opportunity
- [ ] Email integration — sync sent/received emails via Gmail/Outlook OAuth; linked to CRM records
- [ ] Meeting scheduler — antd `DatePicker` + Google Calendar integration; auto-invite participants
- [ ] Quotation builder — RHF line items, multi-currency, discount (%, fixed), tax, validity date
- [ ] Quotation → Sales Order conversion — one-click; pre-fills SO from quotation data
- [ ] Quotation versioning — each resend creates new version; customer receives latest
- [ ] Sales Order lifecycle: `DRAFT` → `CONFIRMED` → `PARTIALLY_DELIVERED` → `DELIVERED` → `INVOICED` → `CANCELLED`
- [ ] SO approval workflow — for orders above threshold amount
- [ ] Delivery Order — partial delivery support; multiple deliveries per SO
- [ ] Customer invoice auto-generated from delivery confirmation — linked to Finance module
- [ ] Credit limit check — warn/block SO creation if customer exceeds credit limit
- [ ] Tiered pricing — quantity-based discounts; customer-group pricing; time-limited promotions
- [ ] Pricelist management — multiple pricelists; currency-specific; assigned per customer
- [ ] Salesperson commission computation — configurable formula (% of revenue, % of profit); payroll-linked
- [ ] Sales return — return authorization → credit note → inventory adjustment
- [ ] Sales analytics — revenue by rep, region, product, period; Recharts bar/line/pie; funnel metrics
- [ ] Customer statement — AR balance, transaction history; PDF export for customer
- [ ] Customer portal (optional) — self-service: view orders, invoices, statements, pay online

---

### Module 13: Project Management

- [ ] Project entity — client, type, budget (time + cost), currency, start/end date, status
- [ ] Project template library — re-use structure from previous projects
- [ ] Milestone tracking — completion % with due date; dependency links
- [ ] Task entity — title, description (Tiptap), priority, status, assignees, estimated hours, due date
- [ ] Sub-task nesting — 3 levels via TypeORM closure table; drag-and-drop reorder within level
- [ ] Kanban board — `@dnd-kit` with custom column colors; swimlane by assignee or priority
- [ ] Gantt chart — `@dhtmlx/gantt` or `react-gantt-chart`; dependency arrows; drag to reschedule
- [ ] Calendar view — tasks by due date; monthly/weekly toggle
- [ ] Manual timer — start/stop per task; accumulates logged hours
- [ ] Bulk time log entry — log hours for multiple tasks in one session (timesheet view)
- [ ] Timesheet approval — weekly timesheet: employee submits → manager approves
- [ ] Budget vs actual — logged hours × employee hourly rate; cost burn-down chart
- [ ] Billable vs non-billable hours — per task; rollup to project level
- [ ] Billable hours → Finance module — generate invoice line items from approved timesheets
- [ ] Resource allocation view — heatmap of team member utilization across projects
- [ ] Team workload balancing — see over/under-allocated members; reassign tasks
- [ ] Project health KPIs — scope creep %, schedule variance %, cost variance %, earned value
- [ ] Project risk register — risk description, probability, impact, mitigation plan, owner
- [ ] Change request workflow — scope change request → approval → impact analysis → approved/rejected
- [ ] Project documents — attach files; linked to Document Management module
- [ ] @mention in task comments — Tiptap; triggers notification to mentioned user via Socket.io
- [ ] Project dashboard — individual project metrics at a glance
- [ ] Portfolio view — all projects across tenant; RAG (Red/Amber/Green) status at a glance
- [ ] Client portal access — share project progress, milestones, and invoices with client (read-only)

---

### Module 14: Asset Management

- [ ] Asset register — category, sub-category, serial number, barcode, purchase date, cost, location, assigned employee
- [ ] Asset categories — IT Equipment, Furniture, Vehicles, Machinery, Intangibles; depreciation method per category
- [ ] Asset lifecycle: `PURCHASED` → `ACTIVE` → `UNDER_MAINTENANCE` → `DISPOSED` → `WRITTEN_OFF`
- [ ] Asset QR/barcode label generation for physical tagging
- [ ] Straight-Line (SL) depreciation — cost / useful life / 12 months per period
- [ ] Declining Balance (DB) depreciation — net book value × depreciation rate per period
- [ ] Units of Production depreciation — cost / total units × units used in period
- [ ] Depreciation run — monthly batch; auto-journal to Finance (Depreciation Expense Dr / Accumulated Depreciation Cr)
- [ ] Asset assignment and return in `asset_assignments` table — history preserved
- [ ] Maintenance log — technician name, date, description, cost, downtime hours
- [ ] Scheduled preventive maintenance — configurable frequency (daily/weekly/monthly); BullMQ cron trigger
- [ ] Maintenance work order — assigned to technician; linked to maintenance log
- [ ] Warranty tracking — warranty expiry date; BullMQ alerts 90/30/7 days before expiry
- [ ] Insurance policy tracking — policy number, insurer, expiry; alert before lapse
- [ ] Physical verification checklist — annual audit; mark each asset found/missing/damaged
- [ ] Disposal workflow — method: sale, scrap, donation; compute NBV gain/loss; auto-journal
- [ ] Asset insurance claim workflow
- [ ] Asset import — CSV bulk import for initial asset register setup
- [ ] Asset report — register, depreciation schedule, NBV summary, assets due for replacement

---

### Module 15: Document Management

- [ ] Folder + tag-based organization — TypeORM recursive tree → antd Tree; drag-and-drop reorganize
- [ ] File upload — antd Upload → NestJS pre-signed MinIO URL → direct S3 PUT; chunked upload for large files
- [ ] Accepted types — PDF, DOCX, XLSX, PNG, JPG, MP4, ZIP; Zod MIME + magic byte validation
- [ ] File size limit — configurable per tenant plan (default 50MB per file, 25GB total)
- [ ] Document versioning — each upload = new `document_version` record; restore previous version
- [ ] Version comparison — diff view for text-based documents (DOCX, TXT)
- [ ] Access control: `PUBLIC`, `DEPARTMENT`, `TEAM`, `OWNER_ONLY`, `ROLE_RESTRICTED`; ACL per folder/file
- [ ] E-signature — HTML5 Canvas → PNG → overlaid on PDF via Puppeteer; multi-party signing workflow
- [ ] Sequential and parallel approval routing — define signer order; each signs and passes to next
- [ ] Signature audit trail — who signed, when, IP address; certificate of completion PDF
- [ ] Document expiry tracking — configurable per category; BullMQ reminders
- [ ] Document templates — HR letters, contracts, NDAs stored as versioned templates
- [ ] Smart template filling — auto-populate employee/company variables from database
- [ ] Full-text search — MeiliSearch indexes document content; search across all accessible documents
- [ ] Document audit trail in `document_access_logs` — view, download, share, edit events
- [ ] Share link — time-limited external share link; optional password protection; view/download only
- [ ] OCR — Tesseract.js processes scanned PDFs; makes content searchable
- [ ] Document import from email — forward email to mailbox; attachments auto-saved to designated folder
- [ ] Bulk download — select multiple documents → ZIP archive → download
- [ ] Recycle bin — soft-deleted files recoverable for 30 days

---

### Module 16: Notification & Communication

- [ ] In-app notification center — antd `Popover` + `Badge` with unread count; mark all as read
- [ ] Real-time push via Socket.io — `@WebSocketGateway` — room per `tenantId:userId`
- [ ] Notification types — Alert, Info, Success, Warning; categorized by module
- [ ] Notification actions — click navigates to related entity; inline approve/reject for leave/PO requests
- [ ] Email — Nodemailer + Handlebars templates; queued via BullMQ `email` worker with retry (3 attempts, exponential backoff)
- [ ] SMS — Twilio / SSLCOMMERZ gateway; queued via BullMQ `sms` worker; opt-out flag per user
- [ ] Push notification (web) — PWA Service Worker via Web Push API; for mobile/PWA users
- [ ] Notification preference settings — per user per notification type (in-app / email / SMS)
- [ ] Template management — admin creates/edits Handlebars templates with `{{variable}}` substitution
- [ ] Template preview — render template with sample data before saving
- [ ] Daily digest email — BullMQ cron; aggregates pending approvals, alerts, reminders for the day
- [ ] Announcement broadcast — admin creates → targets by role/department → fan-out via Socket.io + email
- [ ] @mention in Tiptap — parse mentions on save; push notification to mentioned user
- [ ] Notification snooze — snooze individual notification for 1h / 4h / tomorrow
- [ ] Read receipts — track which notifications were opened (in-app)
- [ ] Notification retention — keep 90 days; BullMQ cron purges older records
- [ ] Internal chat (basic) — direct messaging between users within tenant; powered by Socket.io rooms
- [ ] Chat rooms / channels — team-based channels; @mention; file sharing
- [ ] Chat message search — MeiliSearch indexes chat messages
- [ ] Chat notifications — unread badge per channel; desktop notification
- [ ] Webhook outbound — trigger external systems on events (e.g., Slack, Teams webhook)
- [ ] WebSocket authentication — client sends JWT in Socket.io handshake `auth` payload
- [ ] `handleConnection` validates JWT before joining tenant room; rejects invalid tokens
- [ ] Auto-reconnect with refreshed token on expiry; client-side exponential backoff
- [ ] Room naming: `tenant:{tenantId}:user:{userId}` (private), `tenant:{tenantId}` (broadcast)

---

### Module 17: Audit Logs & Compliance

- [ ] Immutable `audit_logs` table — TypeORM subscriber auto-captures entity changes on every write operation
- [ ] Fields: `id`, `tenant_id`, `actor_id`, `entity_type`, `entity_id`, `action` (CREATE/UPDATE/DELETE/LOGIN/EXPORT), `old_value JSONB`, `new_value JSONB`, `ip_address`, `user_agent`, `correlation_id`, `duration_ms`, `created_at`
- [ ] Correlation ID — every request tagged with `x-correlation-id`; all log entries and audit records share it
- [ ] Module log viewer — antd Table with filter by module, user, action, date range; pagination
- [ ] XLSX / JSON export of audit logs with date range filter
- [ ] Data retention TTL — configurable per module (BullMQ cleanup cron); default 2 years
- [ ] GDPR data export — `GET /admin/gdpr/export/:userId` → ZIP of all personal data across tables
- [ ] GDPR erasure — anonymize PII fields (name, email, phone → `[DELETED]`); preserve financial records with anonymized reference
- [ ] GDPR consent log — track consent events with timestamp and IP
- [ ] Login events — `login_events` table with geo (geoip-lite), device fingerprint, city/country display
- [ ] Login anomaly detection — new country, unusual hour, burst logins → alert to user + admin
- [ ] Bulk operation alerts — delete > N rows, export > N records triggers alert to admin
- [ ] Entity change history — timeline view per record (employee, invoice, etc.) showing all field-level changes
- [ ] Non-repudiation — all approval actions signed with user ID + timestamp; cannot be altered post-approval
- [ ] Compliance report — SOC 2 / ISO 27001 readiness checklist export
- [ ] Data residency flag — per tenant, flag data as Bangladesh / EU / US; determines storage location
- [ ] Access log API — `GET /admin/audit-logs` endpoint for SIEM integration; supports API key auth

---

### Module 18: Reporting & Exports

- [ ] Report builder — select entity, columns, filters, grouping, sorting, aggregation — saved as JSON in DB
- [ ] Saved report templates — personal or team-shared; favorite/pin reports
- [ ] Report categories — HR, Payroll, Finance, Inventory, Procurement, Sales, Projects, Attendance
- [ ] Scheduled report delivery — BullMQ cron → generate → email as attachment (PDF/XLSX); to role or specific users
- [ ] PDF — Puppeteer renders Next.js report route at `/reports/[id]/render`; streams to client with progress
- [ ] XLSX — ExcelJS with column formatting, number formats, freeze headers, summary rows
- [ ] CSV — NestJS streaming `StreamableFile` response for large datasets (avoid memory blow-up)
- [ ] Report drill-down — click aggregated cell → filtered sub-report
- [ ] Cross-module reports — e.g., Headcount × Payroll Cost × Department; join across modules
- [ ] Standard built-in reports:
  - HR: Headcount Summary, Employee Roster, New Hires & Exits, Turnover Analysis, Salary Band Distribution
  - Payroll: Payroll Register, Salary Comparison, Tax Summary, PF/Gratuity Summary, Bank Transfer File
  - Attendance: Daily Attendance, Monthly Summary, Absenteeism Report, Late Arrival, Overtime Report
  - Leave: Leave Balance Summary, Leave Transaction History, Carry-forward Report
  - Finance: Income Statement, Balance Sheet, Cash Flow, Trial Balance, AR Aging, AP Aging, Budget vs Actual
  - Inventory: Stock Valuation, Movement History, Aging Analysis, Reorder Report, Dead Stock
  - Procurement: Purchase Register, Vendor Spend, PO Status, GRN Report
  - Sales: Sales Register, Revenue by Rep, Customer AR Statement, Pipeline Report
  - Projects: Timesheet Summary, Budget vs Actual, Utilization Report
- [ ] Report access control — by role; restrict sensitive reports (e.g., payroll) to HR/Finance roles
- [ ] Report audit trail — log who exported what report and when

---

### Module 19: System Administration

- [ ] Module enable/disable toggle — per tenant in `tenant_modules`; instant effect via Redis cache
- [ ] Password policy — min length, complexity, expiry days, no reuse N passwords; Zod validated
- [ ] MFA enforcement flag — per tenant; forces all users to enroll 2FA on next login
- [ ] Session policy — max concurrent sessions, session timeout, inactivity timeout
- [ ] SMTP configuration override — per tenant; use own email server; test connection button
- [ ] Fiscal year setup — start month, year-end actions (carry-forward leave, close period)
- [ ] Currency setup — base currency; active currencies; exchange rate update
- [ ] Auto-number sequences — per document type (INV-0001, EMP-001, PO-2024-001); configurable prefix/suffix/padding
- [ ] Custom fields builder — add `VARCHAR`, `BOOLEAN`, `DATE`, `NUMBER`, `DROPDOWN` fields to any entity via `custom_field_definitions` + `custom_field_values` tables
- [ ] Workflow engine (lightweight) — define approval workflows per entity type via step builder UI
- [ ] Approval matrix — define approval thresholds by amount, department, and role
- [ ] System announcements — admin broadcast to all users or specific roles
- [ ] DB backup — `pg_dump` via BullMQ cron → MinIO with retention policy
- [ ] Health dashboard — DB pool stats, Redis memory, queue depths, WebSocket connections, last backup
- [ ] BullMQ Bull Board — `/admin/queues` (ADMIN role required); monitor job queues, retry failed jobs
- [ ] Feature flag management — Redis-backed per-tenant flags; toggle from admin UI
- [ ] Maintenance mode — Redis flag → NestJS health endpoint → middleware returns `503` with estimated ETA
- [ ] Recycle bin (global) — soft-deleted records restorable within 30 days; permanent purge
- [ ] Data import templates — downloadable CSV templates for bulk import of all entities
- [ ] IP allowlist management — add/remove allowed IP ranges per tenant
- [ ] API key management for tenants — create/revoke API keys; scoped permissions; expiry date
- [ ] System logs viewer — aggregated Pino JSON logs from Loki; filterable in admin UI
- [ ] Tenant usage analytics — users active today, storage used, API calls today; shown in admin
- [ ] SaaS super-admin panel (separate `/superadmin` route) — manage all tenants, view system health, impersonate tenant

---

### Module 20: API & Integration Layer

- [ ] RESTful API + Swagger UI at `/api/docs` — every endpoint documented with request/response schemas
- [ ] API versioning — `/api/v1/`, `/api/v2/` via NestJS versioning
- [ ] API key management — hash-stored keys (SHA-256 prefix + bcrypt body); scoped permissions per key; expiry date
- [ ] API key rate limiting — separate higher limit for API key clients vs browser sessions
- [ ] Outbound webhooks — entity events → BullMQ; HTTPS POST with HMAC-SHA256 signature; configurable per event type
- [ ] Webhook retry — exponential backoff (1s, 5s, 30s, 5min, 30min); max 5 retries
- [ ] Webhook delivery log — every attempt logged; manual replay from admin UI
- [ ] Inbound webhooks — SSLCommerz, Stripe, Twilio; HMAC signature verified on receipt
- [ ] Rate limiting — `@nestjs/throttler` Redis store; 100 req/min per IP, 1000 req/min per API key
- [ ] Throttle headers — `X-RateLimit-Remaining`, `X-RateLimit-Reset` in response headers
- [ ] Slack integration — webhook notifications for HR events (new hire, payroll run, etc.)
- [ ] Microsoft Teams integration — Adaptive Card notifications
- [ ] Google Calendar sync — leave and interview events; two-way sync
- [ ] Google Workspace SSO — SAML/OAuth via Passport strategy
- [ ] Zapier webhook receiver — trigger workflows from third-party apps
- [ ] Bulk import — streaming CSV processing with progress token; poll `GET /imports/:jobId/status`
- [ ] Bulk export — streaming XLSX/CSV for large datasets; async generation via BullMQ
- [ ] Public REST API for employee self-service mobile app
- [ ] GraphQL API (optional enterprise tier) — NestJS `@nestjs/graphql` with code-first approach

---

### Module 21: Security Hardening

- [ ] HTTPS enforced — HSTS via Nginx (`max-age=31536000; includeSubDomains; preload`)
- [ ] CORS — strict origin whitelist in NestJS CORS config; tenant subdomain whitelist resolved at runtime
- [ ] Helmet.js — CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy
- [ ] Content Security Policy — strict nonce-based CSP in Next.js middleware
- [ ] All DB queries via TypeORM QueryBuilder — parameterized; no raw string concat; SQL injection impossible
- [ ] Input sanitization — `sanitize-html` on backend string DTOs + DOMPurify on Tiptap frontend output
- [ ] CSRF protection — `SameSite=Strict` on httpOnly refresh cookie + CSRF token double-submit pattern
- [ ] File upload security — MIME type + magic byte (file-type library) validation; max size; filename sanitize
- [ ] ClamAV antivirus scan — async scan on file upload via BullMQ; quarantine on detection
- [ ] Auth brute-force protection — 5 failed attempts / 15 min per IP + per account; Redis TTL-backed
- [ ] Secrets management — `@nestjs/config` + Zod at boot; HashiCorp Vault in production; no secrets in code
- [ ] `npm audit` + Snyk scan in CI — fail pipeline on critical CVEs
- [ ] OWASP Dependency Check in CI — weekly scheduled scan
- [ ] PII fields encrypted at rest — TypeORM `@Column` transformer with AES-256-GCM (NID, bank account, TIN, salary)
- [ ] PostgreSQL volume encryption — LUKS / cloud provider-managed encryption
- [ ] RS256 JWT — asymmetric key pair; public key rotatable without invalidating valid tokens
- [ ] Separate JWT secrets — `JWT_ACCESS_SECRET` (RS256 private key) + `JWT_REFRESH_SECRET` (separate HMAC secret)
- [ ] Security headers score — target A+ on securityheaders.com
- [ ] Penetration testing checklist — OWASP Top 10 manual test per major release
- [ ] Responsible disclosure policy — security.txt at `/.well-known/security.txt`
- [ ] mTLS for internal service-to-service — in K8s service mesh (Istio/Linkerd optional)
- [ ] Row-level security audit — automated test suite verifying tenant data isolation
- [ ] Rate limits by endpoint type: Auth 10 req/min/IP, Write 60 req/min/user, Read 200 req/min/user, Uploads 20 req/min/user, API keys 1000 req/min/key
- [ ] `ClassSerializerInterceptor` strips `@Exclude()` fields (password hashes, internal tokens, PII)
- [ ] No stack traces in production errors — global exception filter returns generic message + `correlationId` only
- [ ] PII masking in Pino logs — email, phone, NID, bank account masked in log output
- [ ] Global string length limits — max 10,000 chars for text fields, 255 for single-line; enforced via Zod `.max()`
- [ ] Request body size limit: 10MB for JSON; file uploads via pre-signed URL (direct S3 PUT, no body limit needed)

---

### Module 22: DevOps & Deployment

- [ ] `pr.yml` — ESLint, Prettier, TypeScript compile, Vitest unit tests, Playwright smoke tests on every PR
- [ ] `deploy.yml` — Docker build → GHCR push → K8s rolling deploy on merge to `main`; zero-downtime
- [ ] TypeORM migration auto-run — K8s init container before API pod starts; migrate then boot
- [ ] `husky` + `lint-staged` — ESLint + Prettier + Zod schema check pre-commit
- [ ] Multi-stage Dockerfiles — builder → production; no dev deps in final image; non-root user
- [ ] `docker-compose.yml` local dev — Next.js, NestJS, PostgreSQL 18, Redis, MinIO, MailHog, Bull Board, MeiliSearch
- [ ] `HEALTHCHECK CMD curl -f /health` in all Dockerfiles
- [ ] Non-root user `node:alpine` in all containers
- [ ] Helm chart — deployment, service, ingress, HPA, PDB, ConfigMap, Secret templates
- [ ] HPA — NestJS API scales on CPU > 70%; min 2, max 10 replicas
- [ ] PDB — Pod Disruption Budget ensures minimum 1 replica during node drain
- [ ] Nginx Ingress + `cert-manager` + Let's Encrypt — wildcard cert for `*.nurox.app`
- [ ] ConfigMaps for non-secret env; K8s Secrets for credentials; Vault injector in enterprise
- [ ] Pino structured JSON logs — `correlationId`, `tenantId`, `userId` in every log entry
- [ ] Loki + Grafana — log aggregation; saved dashboards per service
- [ ] Prometheus `/metrics` — NestJS `prom-client`; custom metrics: active_tenants, queue_depth, cache_hit_rate
- [ ] Grafana dashboards — API latency P50/P95/P99, error rate, DB connection pool, queue depths
- [ ] Sentry — `sentry.client.config.ts` (Next.js) + global exception filter (NestJS); release tracking
- [ ] OpenTelemetry traces → Jaeger; trace every HTTP request + DB query + queue job
- [ ] Better Uptime — monitors `/health`, `/api/v1/health`, and key frontend pages; public status page
- [ ] Vitest unit tests — ≥70% coverage threshold; coverage report uploaded to CI artifacts
- [ ] Playwright E2E — login, create employee, run payroll, create invoice, approve leave, manage inventory
- [ ] Testcontainers — NestJS integration tests with real PostgreSQL 18 + Redis; no mock ORM
- [ ] Blue-green deployment support — Helm release name switch via CI environment variable
- [ ] Database backup — `pg_dump` daily via K8s CronJob → MinIO → S3 replication; 30-day retention
- [ ] Disaster recovery runbook — documented in `/docs/DISASTER_RECOVERY.md`; tested quarterly
- [ ] RPO (Recovery Point Objective): ≤ 1 hour — PostgreSQL WAL archiving to S3 for point-in-time recovery
- [ ] RTO (Recovery Time Objective): ≤ 4 hours — documented restore runbook with automated scripts
- [ ] Backup verification: monthly automated restore-and-validate test on isolated environment
- [ ] Prometheus alert rules: error rate >5% for 5min → P1, P95 latency >2s for 10min → P2, DB pool >80% → P2, queue depth >1000 for 10min → P2, disk >85% → P1, SSL cert expiry <14 days → P2
- [ ] On-call rotation — PagerDuty/Opsgenie integration; P1 alerts page on-call engineer immediately

---

### Module 23: SaaS Billing & Subscription

- [ ] Subscription plans — Starter, Growth, Business, Enterprise (defined in `subscription_plans` table)
- [ ] Plan features matrix — module access, user seats, storage limit, API rate limit per plan
- [ ] Stripe integration — `stripe.customers.create` on tenant signup; `stripe.subscriptions.create` on plan select
- [ ] 🇧🇩 SSLCommerz integration (Bangladesh market) — hosted payment page; IPN webhook handler
- [ ] bKash / Nagad API integration — mobile banking payments for BD market
- [ ] Free trial — 14-day trial on signup; `trial_ends_at` field; BullMQ reminder at 7/3/1 days before expiry
- [ ] Trial-to-paid conversion — in-app upgrade prompt; plan comparison modal
- [ ] Billing portal — powered by Stripe Customer Portal; manage plan, payment method, invoices
- [ ] SaaS invoice generation — monthly/annual billing; NestJS generates invoice + Puppeteer PDF + emails tenant
- [ ] Usage-based billing (optional) — API calls, storage over quota → additional line item
- [ ] Proration — upgrade mid-cycle prorates charge; downgrade credits next cycle
- [ ] Annual discount — 20% discount for annual billing; toggle in pricing page
- [ ] Coupon / promo code — Stripe coupon applied at checkout; usage limit + expiry
- [ ] Dunning management — failed payment → retry 3x → email notifications → account suspension → grace period
- [ ] Account suspension — plan-restricted access; banner shown; data retained 90 days post-suspension
- [ ] Plan limits enforcement — seat count check on user creation; storage check on file upload; module guard
- [ ] Billing analytics (super-admin) — MRR, ARR, churn rate, LTV, new subscriptions, upgrades, downgrades
- [ ] Revenue recognition — invoice accrual logic per period for accurate reporting
- [ ] Data export on cancellation — full ZIP (JSON + attachments) downloadable within 90-day grace period
- [ ] Pre-deletion reminders — email at 60/30/7 days before permanent data deletion after cancellation
- [ ] Account freeze option — tenant pauses billing (vacation mode); data preserved for up to 12 months
- [ ] Account reactivation — frozen accounts can reactivate within 12 months; billing resumes at same plan
- [ ] Account deletion — permanent; requires double confirmation + admin approval

---

### Module 24: Customer Support & Help Desk

- [ ] Ticket creation — employee raises support ticket with category, priority, description, attachments
- [ ] Ticket categories — IT Support, HR Query, Finance Query, Payroll Issue, Access Request, Bug Report, Feature Request
- [ ] Ticket lifecycle: `OPEN` → `IN_PROGRESS` → `PENDING_USER` → `RESOLVED` → `CLOSED`
- [ ] SLA configuration — response and resolution time targets per priority (P1/P2/P3/P4)
- [ ] SLA breach alerts — BullMQ timer; notify assigned agent and manager on SLA breach
- [ ] Assignment rules — auto-assign by category to responsible team/agent
- [ ] Internal notes — private notes visible only to support team (Tiptap)
- [ ] Public replies — visible to ticket requester via email and in-app notification
- [ ] Email-to-ticket — forward support email to dedicated mailbox; Nodemailer IMAP parser creates ticket
- [ ] Ticket escalation — auto-escalate to manager if unresolved after N hours
- [ ] CSAT survey — on ticket close, email 1-5 star rating form; aggregated in support analytics
- [ ] Knowledge base — article categories, Tiptap rich text, search via MeiliSearch
- [ ] Knowledge base article lifecycle — DRAFT → PUBLISHED → ARCHIVED; internal vs public
- [ ] AI-powered answer suggestions — when creating ticket, AI searches KB and suggests relevant articles
- [ ] Support analytics dashboard — open tickets, avg resolution time, SLA compliance %, CSAT score
- [ ] SaaS-level support portal — Nurox team responds to tenant admins for platform issues

---

### Module 25: AI & Automation Layer

- [ ] AI assistant (chat widget) — embedded in dashboard; powered by Anthropic / OpenAI API; answers ERP queries in plain English
- [ ] Natural language data query — "Show me payroll expenses for Q3 by department" → generates and executes safe read-only SQL → chart
- [ ] Smart search — MeiliSearch global search + AI re-ranking; typo-tolerant; ranked by relevance + user behavior
- [ ] Resume parser — OpenAI extracts name, email, skills, experience, education from uploaded PDF/DOCX
- [ ] AI candidate shortlisting — embeddings-based job description × resume similarity score
- [ ] Smart expense categorization — AI classifies expense claims to GL accounts from description + amount
- [ ] Invoice OCR + auto-fill — upload vendor invoice image → Tesseract OCR + AI extracts line items → pre-fills bill form
- [ ] Anomaly detection — statistical model flags unusual payroll amounts, stock movements, or login patterns
- [ ] Predictive stock reorder — ML model (simple regression) suggests reorder quantities based on historical consumption
- [ ] Churn risk scoring — identify employees likely to resign based on attendance patterns, leave frequency, survey scores
- [ ] Sales forecast — time-series forecasting of pipeline conversion + revenue; displayed in Sales dashboard
- [ ] AI-generated meeting summaries — paste meeting notes → AI extracts action items → creates tasks in Projects
- [ ] Smart report builder — describe report in natural language → AI generates report config → preview
- [ ] Workflow automation builder — if/then rules UI (no-code); trigger events → actions; e.g., "When leave approved → notify team via Slack"
- [ ] Auto-tagging of documents — AI classifies uploaded documents (contract, invoice, certificate) and auto-assigns tags
- [ ] Email drafting assistant — AI drafts rejection emails, offer letters, announcement text from bullet points
- [ ] Spend optimization suggestions — AI analyzes procurement spend and suggests consolidation or alternative vendors

---

### Module 26: Mobile & PWA

- [ ] Progressive Web App (PWA) — `next-pwa` service worker; installable on Android/iOS from browser
- [ ] Offline-first attendance — service worker caches last-known check-in state; sync when online
- [ ] Mobile-optimized layouts — responsive antd Grid; hamburger menu on mobile; bottom tab navigation
- [ ] React Native app (optional future) — Expo-based; shares `@repo/zod-schemas` and API client logic
- [ ] Mobile push notifications — Web Push API via service worker; `vapid` keys in NestJS
- [ ] Mobile QR check-in — camera access via `react-webcam`; scan QR code for attendance
- [ ] Mobile leave application — quick leave apply form; manager approval action in notification
- [ ] Mobile payslip viewer — `react-pdf`; download payslip as PDF
- [ ] Mobile task management — view assigned tasks; update status; log time
- [ ] Biometric login (PWA) — WebAuthn / FIDO2 via `@simplewebauthn/browser`; fingerprint / FaceID on supported devices
- [ ] Mobile dashboard — KPI cards in swipeable carousel; chart widgets stacked vertically
- [ ] App manifest — `manifest.json` with app name, icons, theme color; splash screen
- [ ] App Store listing preparation — screenshots, description, privacy policy for optional React Native app

---

### Module 27: E-Commerce & POS Integration

- [ ] POS (Point of Sale) module — touch-friendly sales interface; product search by name/barcode
- [ ] POS cash register — open/close till; cash float; end-of-day reconciliation
- [ ] POS payment methods — cash, card, mobile banking (bKash, Nagad), split tender
- [ ] POS receipt — thermal receipt PDF/print; email receipt option
- [ ] POS inventory sync — real-time stock deduction from POS sale; linked to Inventory module
- [ ] POS customer loyalty points — accumulate per transaction; redeem as discount
- [ ] POS shift management — cashier opens/closes shifts; cash count reconciliation
- [ ] E-commerce storefront (optional) — basic product catalog with `pages/shop`; cart; checkout → Sales Order
- [ ] Shopify integration — webhook sync: products, orders, inventory levels; via API integration layer
- [ ] WooCommerce integration — REST API sync: orders → SO; stock update → WC inventory
- [ ] Order fulfillment — pick list from e-commerce orders; warehouse picker app (mobile-optimized)
- [ ] Shipping integration — Pathao, Paperfly, RedX (BD); DHL, FedEx (international); label generation
- [ ] Returns management — RMA workflow; refund processing linked to Finance

---

### Module 28: Manufacturing & Production

- [ ] Bill of Materials (BOM) — multi-level BOM with version control; raw materials, sub-assemblies, finished goods
- [ ] BOM cost roll-up — total material cost computed recursively up the BOM tree
- [ ] Work Order (WO) lifecycle: `DRAFT` → `RELEASED` → `IN_PROGRESS` → `COMPLETED` → `CLOSED`
- [ ] Production planning — capacity-based scheduling; WO scheduled to available machines/workcenters
- [ ] Workcenter management — machine, labor, overhead cost per hour
- [ ] Production routing — sequence of operations per BOM; estimated cycle time per step
- [ ] Material requisition — auto-generate material issue from WO BOM; deducts from raw material stock
- [ ] Work-in-Progress (WIP) tracking — partial completion; WIP journal to Finance
- [ ] Finished goods receipt — confirm WO completion; increment finished goods stock; COGS journal
- [ ] Scrap and rework — log scrap quantity with reason; rework WO creation
- [ ] Production run report — planned vs actual output, efficiency %, scrap %
- [ ] Quality control checklist — per WO step; pass/fail criteria; linked to rejection workflow
- [ ] Manufacturing analytics — machine utilization, OEE (Overall Equipment Effectiveness), yield %

---

### Module 29: Logistics & Fleet Management

- [ ] Vehicle master — registration, make/model, year, fuel type, capacity, insurance/road tax expiry
- [ ] Vehicle assignment — assign to driver + project/department; track by date range
- [ ] Fuel log — odometer, fuel quantity, cost per fill-up; fuel efficiency trend
- [ ] Maintenance schedule — service intervals (km or days); BullMQ alert before due
- [ ] Driver management — license type, expiry; linked to employee record
- [ ] Trip log — origin, destination, purpose, distance, driver, start/end odometer
- [ ] Delivery order management — from Sales module; assigned to vehicle + driver
- [ ] Route optimization (basic) — order of delivery stops; integration with Google Maps Directions API
- [ ] Live vehicle tracking (optional) — GPS device webhook → NestJS → Socket.io → Mapbox live map
- [ ] Delivery confirmation — driver app / tablet: scan barcode, capture signature / photo proof of delivery
- [ ] Fleet cost report — total fuel, maintenance, insurance, driver salary per vehicle per period
- [ ] Vehicle document alerts — insurance, road tax, fitness certificate expiry; BullMQ notifications

---

### Module 30: Compliance, Tax & Regulatory

- [ ] Country-specific tax engine — pluggable tax calculators per country; BD / IN / US modules
- [ ] 🇧🇩 Bangladesh NBR compliance — TIN linkage; AIT deduction; VAT 15%; TDS schedule

- [ ] India GST compliance — GSTIN per entity; CGST/SGST/IGST computation; GSTR-1 / GSTR-3B export
- [ ] US payroll tax — Federal + State income tax, FICA (Social Security + Medicare), FUTA/SUTA
- [ ] Tax return filing export — structured XML / CSV per tax authority format
- [ ] E-invoicing compliance — BD NBR e-invoice format; digital signature; submission API
- [ ] Transfer pricing documentation — inter-company transaction documentation template
- [ ] Statutory compliance calendar — deadline tracker per country (TDS due date, VAT return, annual filing)
- [ ] Compliance alert — BullMQ cron checks upcoming deadlines; notifies Finance Manager 30/14/7 days before
- [ ] Audit trail for compliance — all tax-affecting transactions flagged; immutable records
- [ ] GDPR compliance tools — data subject access request handling; erasure workflow; consent management
- [ ] ISO 27001 control mapping — control checklist; evidence collection against controls
- [ ] SOC 2 Type II readiness — control documentation; policy templates
- [ ] Regulatory change log — admin records upcoming regulatory changes; team notified; impact tagged to modules
- [ ] Labor law compliance (BD) — minimum wage check on salary entry; maternity leave law enforcement; working hours cap
- [ ] Company registration document storage — trade license, TIN certificate, VAT registration; expiry tracking

---

## 9. SaaS Go-To-Market Strategy

### 9.1 Pricing Strategy

```
Freemium → Starter ($49/mo) → Growth ($149/mo) → Business ($399/mo) → Enterprise (custom)
- Free tier: 5 users, HR + Attendance only (lead generation)
- Annual billing: 20% discount
- Per-seat add-on: +$2/user/mo above plan limit
- Module add-ons: sell specific modules to existing customers upgrading incrementally
- Partner / reseller discounts: 20-30% for white-label or system integrator partners
```

### 9.2 Revenue Expansion Levers

- Upsell modules — surface upgrade prompts when user tries to access disabled module
- Seat-based expansion — track active user count; auto-email when approaching seat limit
- Storage upgrade — prompt when 80% of storage quota used
- Professional services — implementation, data migration, custom report development
- Training & certifications — paid online training program for HR/Finance users
- White-label — white-label Nurox for HR consultancies or payroll bureaus (enterprise tier)

### 9.3 Retention Strategy

- Onboarding success team — automated 30-day onboarding email sequence + optional onboarding call
- In-app onboarding checklist — progress tracker shown on first login; rewards completion
- Health score tracking — engagement score based on DAU/WAU, features used, data completeness
- Customer success alerts — low health score → CS team outreach trigger
- NPS survey — in-app at 30/90/180 day marks; follow-up for detractors

### 9.4 Target Markets

```
Primary:   Bangladesh SMB and mid-market (100–1000 employees)
Secondary: SAARC region (India, Sri Lanka, Nepal, Pakistan)
Tertiary:  SE Asia diaspora / expat-led companies
Vertical:  Garments / RMG, NGO, Healthcare, Education, Manufacturing, IT Services
```

### 9.5 Legal Requirements

- Terms of Service at `nurox.app/terms` — required acceptance before tenant signup
- Privacy Policy at `nurox.app/privacy` — GDPR and local (e.g., BDPA) compliant
- Data Processing Agreement (DPA) — available for Enterprise customers on request
- Service Level Agreement (SLA) — 99.9% uptime guarantee for Business/Enterprise plans
- Cookie consent banner — required for EU users; consent stored in `user_consent_log`
- Acceptable Use Policy — prohibits illegal use, abuse, data harvesting
- Right to data export — tenant admin can export all tenant data at any time (GDPR Art. 20)
- Right to erasure — tenant admin can request full data deletion (GDPR Art. 17); admin approval required

---

## 10. Appendices

### Appendix A — Module Dependency Map

```
Authentication (Custom JWT — Passport.js + Redux)
    └── User & Org Management
            ├── HR ──────────────── Payroll ←── Attendance
            │       └── Recruitment            └── Leave
            │               └── Onboarding
            ├── Finance
            │       ├── AR ←── Sales & CRM ←── Inventory ←── Manufacturing
            │       └── AP ←── Procurement ←── Inventory
            ├── Projects ──────────────────────── Finance (billing)
            ├── Assets ────────────────────────── Finance (depreciation)
            ├── Manufacturing ─────── Inventory (BOM, WO) ←── Procurement
            ├── Logistics ────────── Sales (delivery) ←── Inventory
            └── POS ─────────────── Sales ←── Inventory

All Modules → Audit Logs → Reporting → Export (PDF / XLSX / CSV)
All Modules → Notification System (Socket.io, Email, SMS, Push)
All Modules → Document Management (uploads, e-sign)
All Modules → Custom Fields (custom_field_definitions)
All Modules → AI Layer (smart suggestions, anomaly detection)
Admin Modules → SaaS Billing (seat/module checks)
```

### Appendix B — Database Schema Overview

```sql
-- Core tables
tenants, tenant_modules, tenant_settings, tenant_custom_domains,
users, user_sessions, login_events, user_preferences,
roles, permissions, role_permissions, user_roles,
audit_logs, notifications, notification_preferences,
custom_field_definitions, custom_field_values,
approval_matrices, workflow_steps, workflow_instances

-- HR
employees, departments, positions, grades, branches,
employment_history, salary_revisions, probation_records,
performance_goals, performance_reviews, pip_records,
training_courses, training_enrollments, skill_catalog, employee_skills,
onboarding_checklists, onboarding_tasks

-- Payroll
salary_structures, salary_components, payroll_runs, payroll_run_items,
payroll_journals, employee_loans, loan_repayments, tax_configurations

-- Attendance & Leave
attendance_records, shifts, shift_assignments,
leave_types, leave_policies, leave_balances, leave_applications, leave_transactions,
public_holidays, working_calendars

-- Recruitment
job_requisitions, job_postings, candidates, applications,
interview_slots, interview_feedback, offers

-- Finance
accounts, accounting_periods, journal_entries, journal_lines,
invoices, invoice_lines, invoice_payments,
bills, bill_lines, bill_payments,
bank_accounts, bank_statements, bank_transactions, reconciliations,
budgets, budget_lines, expense_claims, petty_cash_transactions,
tax_rates, tax_configurations

-- Inventory
products, product_variants, product_categories,
warehouses, warehouse_zones, warehouse_racks, warehouse_bins,
stock_movements, stock_levels, batch_lots, serial_numbers,
physical_count_sessions, physical_count_lines

-- Procurement
vendors, vendor_contacts, vendor_documents,
purchase_requisitions, rfqs, rfq_responses, purchase_orders, po_lines,
grns, grn_lines, debit_notes

-- Sales & CRM
leads, contacts, companies, opportunities, activities,
quotations, quotation_lines, sales_orders, so_lines,
delivery_orders, delivery_lines, credit_notes, pricelists

-- Projects
projects, milestones, tasks, task_assignments,
time_logs, timesheets, project_documents, project_risks

-- Assets
asset_categories, assets, asset_assignments,
depreciation_runs, depreciation_records,
maintenance_logs, maintenance_schedules

-- Documents
document_folders, documents, document_versions, document_access_logs,
e_signatures, signature_workflows

-- Manufacturing
boms, bom_lines, work_orders, wo_operations, wo_material_issues

-- Logistics
vehicles, drivers, trips, routes  -- NOTE: delivery_orders defined in Sales/CRM schema

-- Billing (SaaS)
subscription_plans, subscriptions, billing_invoices, payments, coupons

-- Support
support_tickets, ticket_comments, sla_configs, knowledge_articles
```

### Appendix C — TypeORM Migration Workflow

```bash
# Generate migration from entity changes
npx typeorm migration:generate src/database/migrations/AddEmployeeSkillMatrix \
  -d src/config/typeorm.config.ts

# Run all pending migrations
npx typeorm migration:run -d src/config/typeorm.config.ts

# Revert last migration
npx typeorm migration:revert -d src/config/typeorm.config.ts

# Seed staging database
npx ts-node src/database/seeds/run-seeds.ts
```

### Appendix D — Environment Variables

```bash
# ── apps/web/.env.local ──────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=

# ── apps/api/.env ────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@localhost:5432/nurox_erp
DATABASE_SCHEMA=public
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=                     # RS256 private key
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=900                  # 15 min
JWT_REFRESH_EXPIRY=604800              # 7 days
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=nurox-erp
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_FROM=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=
SENTRY_DSN=
FRONTEND_URL=https://nurox.app
VAULT_ADDR=                            # HashiCorp Vault (production)
VAULT_TOKEN=
POSTHOG_API_KEY=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
```

### Appendix E — Docker Compose (Local Dev)

```yaml
# infra/docker/docker-compose.yml

services:
  web:
    build: ../../apps/web
    ports: ["3000:3000"]
    env_file: ../../apps/web/.env.local
    depends_on: [api]

  api:
    build: ../../apps/api
    ports: ["3001:3001"]
    env_file: ../../apps/api/.env
    depends_on: [postgres, redis, minio, meilisearch]

  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: nurox_erp
      POSTGRES_USER: nurox
      POSTGRES_PASSWORD: nurox_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports: ["9000:9000", "9001:9001"]
    volumes:
      - miniodata:/data

  meilisearch:
    image: getmeili/meilisearch:v1.7
    ports: ["7700:7700"]
    environment:
      MEILI_MASTER_KEY: nurox_dev_meili_key
    volumes:
      - meilidata:/meili_data

  mailhog:
    image: mailhog/mailhog
    ports: ["1025:1025", "8025:8025"]

  bullboard:
    image: deadly0/bull-board
    ports: ["3002:3000"]
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379

volumes:
  pgdata:
  miniodata:
  meilidata:
```

### Appendix F — Permissions Reference

```
Format: module:resource:action

HR
  hr:employees:read           hr:employees:write          hr:employees:delete
  hr:departments:read         hr:departments:write
  hr:positions:read           hr:positions:write
  hr:performance:read         hr:performance:write
  hr:training:read            hr:training:write
  hr:org-chart:read

Payroll
  payroll:runs:read           payroll:runs:write          payroll:runs:approve
  payroll:runs:process        payroll:structures:read     payroll:structures:write
  payroll:payslips:read       payroll:payslips:download

Attendance & Leave
  attendance:records:read     attendance:records:write
  leave:requests:read         leave:requests:write        leave:requests:approve
  leave:types:read            leave:types:write
  leave:balances:read

Finance
  finance:journals:read       finance:journals:write      finance:journals:approve
  finance:invoices:read       finance:invoices:write      finance:invoices:void
  finance:bills:read          finance:bills:write         finance:bills:approve
  finance:reports:read        finance:bank:read           finance:bank:write
  finance:budgets:read        finance:budgets:write

Inventory
  inventory:products:read     inventory:products:write    inventory:products:delete
  inventory:stock:read        inventory:stock:write
  inventory:warehouses:read   inventory:warehouses:write

Procurement
  procurement:pr:read         procurement:pr:write
  procurement:po:read         procurement:po:write        procurement:po:approve
  procurement:grn:read        procurement:grn:write
  procurement:vendors:read    procurement:vendors:write

Sales
  sales:leads:read            sales:leads:write
  sales:opportunities:read    sales:opportunities:write
  sales:orders:read           sales:orders:write          sales:orders:approve
  sales:customers:read        sales:customers:write
  sales:invoices:read         sales:invoices:write

Projects
  projects:read               projects:write              projects:delete
  projects:tasks:read         projects:tasks:write
  projects:timesheets:read    projects:timesheets:write   projects:timesheets:approve

Assets
  assets:register:read        assets:register:write
  assets:depreciation:read    assets:depreciation:run
  assets:maintenance:read     assets:maintenance:write

Documents
  documents:read              documents:write             documents:delete
  documents:share             documents:sign

Manufacturing
  manufacturing:bom:read      manufacturing:bom:write
  manufacturing:wo:read       manufacturing:wo:write      manufacturing:wo:complete

Logistics
  logistics:fleet:read        logistics:fleet:write
  logistics:deliveries:read   logistics:deliveries:write

Support
  support:tickets:read        support:tickets:write       support:tickets:manage
  support:kb:read             support:kb:write

Admin
  admin:users:read            admin:users:write           admin:users:delete
  admin:roles:read            admin:roles:write
  admin:settings:read         admin:settings:write
  admin:billing:read          admin:billing:write
  admin:audit:read            admin:integrations:write
  admin:feature-flags:write
```

### Appendix G — API Endpoint Matrix (Summary)

```
Auth          POST /api/v1/auth/login|refresh|logout|register|forgot-password|reset-password|verify-email
Users         GET|POST /api/v1/users · GET|PUT|DELETE /api/v1/users/:id
Employees     GET|POST /api/v1/employees · GET|PUT|DELETE /api/v1/employees/:id
Departments   GET|POST /api/v1/departments · GET|PUT|DELETE /api/v1/departments/:id
Payroll       GET|POST /api/v1/payroll/runs · POST /api/v1/payroll/runs/:id/approve|process
Attendance    GET|POST /api/v1/attendance · POST /api/v1/attendance/check-in|check-out
Leave         GET|POST /api/v1/leave/applications · PATCH /api/v1/leave/applications/:id/approve|reject
Finance       GET|POST /api/v1/finance/invoices|bills|journals · POST /api/v1/finance/reconciliation
Inventory     GET|POST /api/v1/inventory/products|stock-movements · GET /api/v1/inventory/valuation
Procurement   GET|POST /api/v1/procurement/purchase-orders|grn · PATCH /api/v1/procurement/po/:id/approve
Sales         GET|POST /api/v1/sales/leads|opportunities|orders|quotations
Projects      GET|POST /api/v1/projects · GET|POST /api/v1/projects/:id/tasks|timesheets
Assets        GET|POST /api/v1/assets · POST /api/v1/assets/depreciation/run
Documents     GET|POST /api/v1/documents · GET /api/v1/documents/:id/presigned-url
Reports       GET /api/v1/reports/:type?format=pdf|xlsx|csv
Admin         GET|POST /api/v1/admin/users|roles|settings|audit-logs|feature-flags
Billing       GET|POST /api/v1/billing/subscriptions|invoices · POST /api/v1/billing/webhooks/stripe
Health        GET /health · GET /api/v1/health
```

### Appendix H — Database Indexing Strategy

```
Strategy: Every multi-tenant query MUST use tenant_id in the WHERE clause. All indexes include tenant_id.

-- Composite B-tree indexes (all tables)
CREATE INDEX idx_{table}_tenant ON {table}(tenant_id);
CREATE INDEX idx_{table}_tenant_created ON {table}(tenant_id, created_at DESC);
CREATE INDEX idx_{table}_tenant_status ON {table}(tenant_id, status) WHERE deleted_at IS NULL;

-- Unique composites (per-tenant uniqueness)
CREATE UNIQUE INDEX idx_employees_tenant_code ON employees(tenant_id, employee_code);
CREATE UNIQUE INDEX idx_employees_tenant_email ON employees(tenant_id, email);
CREATE UNIQUE INDEX idx_products_tenant_sku ON products(tenant_id, sku);
CREATE UNIQUE INDEX idx_products_tenant_barcode ON products(tenant_id, barcode) WHERE barcode IS NOT NULL;

-- Full-text search (GIN indexes for MeiliSearch sync fallback)
CREATE INDEX idx_employees_search ON employees USING gin(to_tsvector('english', first_name || ' ' || last_name));
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));

-- Partial indexes (active records only — most queries filter deleted)
CREATE INDEX idx_employees_active ON employees(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_unpaid ON invoices(tenant_id, status) WHERE status IN ('DRAFT', 'SENT', 'OVERDUE');

-- Foreign key indexes (TypeORM does NOT auto-create these)
-- Every @ManyToOne column must have an explicit index
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
```

### Appendix I — Error Code Catalog

```
Format: { code: number, message: string, correlationId: string }

Code Range    Module              Examples
─────────────────────────────────────────────────────────────────────
1000-1099     Auth                1001: Invalid credentials
                                  1002: Account locked (too many attempts)
                                  1003: MFA required
                                  1004: Refresh token expired/revoked
                                  1005: Session limit exceeded
                                  1006: IP not in allowlist
1100-1199     Users               1101: Email already exists
                                  1102: Invite expired
                                  1103: Insufficient seats (plan limit)
1200-1299     HR                  1201: Employee code already exists
                                  1202: Cannot delete department with employees
                                  1203: Circular manager reference
1300-1399     Payroll             1301: Payroll already processed for this period
                                  1302: Salary structure not assigned
                                  1303: Tax bracket not configured for fiscal year
1400-1499     Finance             1401: Unbalanced journal entry (debits ≠ credits)
                                  1402: Accounting period closed
                                  1403: Invoice already voided
                                  1404: Bank reconciliation mismatch
1500-1599     Inventory           1501: Insufficient stock for movement
                                  1502: Duplicate SKU
                                  1503: Negative stock not allowed
1600-1699     Procurement         1601: PO already approved
                                  1602: GRN quantity exceeds PO quantity
1700-1799     Sales               1701: Lead already converted
                                  1702: Order cannot be cancelled (already shipped)
1800-1899     Projects            1801: Timesheet already approved
                                  1802: Task dependency cycle detected
1900-1999     System              1901: Feature not available on current plan
                                  1902: Tenant module disabled
                                  1903: File too large / invalid MIME type
9000-9099     Infrastructure      9001: Database connection failed
                                  9002: Redis unavailable
                                  9003: External service timeout
```

### Appendix J — Feature Count Summary

| Module                      | Feature Items     |
| --------------------------- | ----------------- |
| 1. Core Platform            | 28                |
| 2. Auth & AuthZ             | 34                |
| 3. User & Org               | 20                |
| 4. Dashboard                | 19                |
| 5. Human Resources          | 28                |
| 6. Payroll                  | 23                |
| 7. Attendance & Leave       | 33                |
| 8. Recruitment & Onboarding | 31                |
| 9. Finance & Accounting     | 37                |
| 10. Inventory               | 26                |
| 11. Procurement             | 21                |
| 12. Sales & CRM             | 27                |
| 13. Project Management      | 26                |
| 14. Asset Management        | 20                |
| 15. Document Management     | 21                |
| 16. Notifications           | 26                |
| 17. Audit & Compliance      | 16                |
| 18. Reporting & Exports     | 20                |
| 19. System Administration   | 21                |
| 20. API & Integrations      | 20                |
| 21. Security Hardening      | 28                |
| 22. DevOps & Deployment     | 33                |
| 23. SaaS Billing            | 23                |
| 24. Help Desk & Support     | 17                |
| 25. AI & Automation         | 17                |
| 26. Mobile & PWA            | 13                |
| 27. E-Commerce & POS        | 14                |
| 28. Manufacturing           | 13                |
| 29. Logistics & Fleet       | 12                |
| 30. Compliance & Tax        | 15                |
| **TOTAL**                   | **~692 features** |

---

_Nurox ERP Master Documentation — April 2026 — v2.1_
_Stack: Next.js 16 · NestJS 11 · Ant Design 6 · TypeORM 1.0 · PostgreSQL 18 · Redux Toolkit + RTK Query · React Hook Form · Zod 4 · Custom JWT Auth · Redis · BullMQ · MeiliSearch · Docker · Kubernetes_
_Design System: Liquid Precision — "The Architectural Infinite" · Deep Space Palette · Space Grotesk + Manrope_
_Total: 30 modules · ~692 feature items · SaaS-first · Multi-tenant · API-first · Event-driven_
