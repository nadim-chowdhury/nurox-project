# Nurox ERP — Production-Ready System Documentation

> ⚠️ **DEPRECATED** — This document has been superseded by [`NUROX_ERP_MASTER_ARCHITECTURE.md`](./NUROX_ERP_MASTER_ARCHITECTURE.md) (v2.1).
> All new architectural decisions, tech stack updates, and module specifications should reference the **Master Architecture** document.
> This file is retained for historical reference only. Do NOT update this file.

> **Project:** Nurox ERP · **Design System:** Liquid Precision (Architectural Infinite)
> **Stack:** Next.js 16 · NestJS 11 · TypeORM 1.0 · PostgreSQL 18 · Ant Design 6.x · RTK Query · Custom JWT Auth (Passport.js)
> **Last Updated:** April 2026

---

## Table of Contents

1. [Complete Tech Stack](#1-complete-tech-stack)
2. [Design System — Liquid Precision](#2-design-system--liquid-precision)
3. [Ant Design Integration & Theming](#3-ant-design-integration--theming)
4. [Complete File & Folder Structure](#4-complete-file--folder-structure)
5. [Frontend Architecture Patterns](#5-frontend-architecture-patterns)
6. [Backend Architecture Patterns](#6-backend-architecture-patterns)
7. [Feature Modules (1–22)](#7-feature-modules)
8. [Appendices](#8-appendices)
9. [Extended Specifications](#9-extended-specifications)

---

## 9. Extended Specifications

To ensure production-readiness, refer to these specialized documents for granular implementation details:

- [**Data Dictionary & Schema**](./DATA_DICTIONARY.md) — Exact database columns, types, and constraints.
- [**API Contract**](./API_CONTRACT.md) — Complete REST endpoint matrix and request/response payloads.
- [**Business Logic Specs**](./BUSINESS_LOGIC.md) — Calculation formulas for Payroll, Finance, and Inventory.

---

## 1. Complete Tech Stack

### 1.1 Frontend

| Category                | Technology                       | Version            | Purpose                                                                                                                       |
| ----------------------- | -------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Framework               | Next.js                          | 16 (App Router)    | SSR, SSG, RSC, routing                                                                                                        |
| Language                | TypeScript                       | 5.x                | Type safety                                                                                                                   |
| UI Component Library    | **Ant Design (antd)**            | **6.x**            | Primary component library — forms, tables, modals, date pickers, upload, notifications                                        |
| Layout Utilities        | TailwindCSS                      | 4.x                | Spacing, flex, grid utilities only — no component styling                                                                     |
| Icons                   | @ant-design/icons + Lucide React | 6.x                | Icon set (antd icons primary, lucide for custom)                                                                              |
| Form Management         | React Hook Form                  | 7.x                | Performant form state                                                                                                         |
| Schema Validation       | Zod                              | 4.x                | Runtime validation (shared frontend ↔ backend via `@repo/shared-schemas`)                                                     |
| RHF + Zod Bridge        | @hookform/resolvers              | latest             | `zodResolver` integration                                                                                                     |
| State Management        | Redux Toolkit                    | 2.x                | Global UI state only (excluding server & form state)                                                                          |
| Server State / API      | RTK Query                        | (bundled with RTK) | Data fetching, caching, mutations                                                                                             |
| Auth State Persistence  | redux-persist                    | latest             | Persist auth slice to localStorage                                                                                            |
| Auth (Frontend Session) | Custom JWT (Redux + httpOnly)    | —                  | Token storage in Redux (memory) + httpOnly refresh cookie; no third-party auth lib                                            |
| Rich Text Editor        | Tiptap                           | 2.x                | Descriptions, announcements, notes                                                                                            |
| Date Handling           | date-fns                         | 3.x                | Formatting, arithmetic, locale                                                                                                |
| Charts                  | Recharts                         | 2.x                | Bar, Line, Area, Pie, Donut                                                                                                   |
| Data Tables             | TanStack Table                   | 8.x                | Advanced client-side filtering/sorting on large (10k+ row) virtualized datasets only; standard tables use antd Table directly |
| Virtualization          | TanStack Virtual                 | 3.x                | Large list rendering                                                                                                          |
| Drag & Drop             | @dnd-kit/core                    | 6.x                | Kanban boards, sortable lists                                                                                                 |
| File Upload             | antd Upload                      | —                  | Drag-and-drop file input (antd Upload has built-in drag support; no separate library needed)                                  |
| PDF Viewer              | react-pdf                        | 7.x                | In-app PDF preview                                                                                                            |
| Toast Notifications     | antd message + notification API  | —                  | Non-blocking toasts (accessed via `antd-message.ts` global instance for use outside components)                               |
| Animations              | Framer Motion                    | 11.x               | Page transitions, micro-interactions                                                                                          |
| Real-time               | Socket.io Client                 | 4.x                | WebSocket connection                                                                                                          |
| i18n                    | next-intl                        | 3.x                | Multi-language + locale routing                                                                                               |
| Component Docs          | Storybook                        | 8.x                | Component development and documentation                                                                                       |
| Testing                 | Vitest + Testing Library         | latest             | Unit + component tests                                                                                                        |
| E2E Testing             | Playwright                       | latest             | Critical flow automation                                                                                                      |
| Linting                 | ESLint (flat config)             | 9.x                | Code quality                                                                                                                  |
| Formatting              | Prettier                         | 3.x                | Code formatting                                                                                                               |

### 1.2 Backend

| Category         | Technology                         | Version | Purpose                                                |
| ---------------- | ---------------------------------- | ------- | ------------------------------------------------------ |
| Framework        | NestJS                             | 11.x    | Modular Node.js backend                                |
| Language         | TypeScript                         | 5.x     | Strict type safety                                     |
| ORM              | TypeORM                            | 0.3.x   | Database access, migrations, relations                 |
| Database         | PostgreSQL                         | 18      | Primary relational store                               |
| Cache            | Redis                              | 7.x     | Session, cache, rate limit store                       |
| Queue            | BullMQ                             | 5.x     | Background jobs, email, payroll runs                   |
| Auth             | Passport.js + JWT                  | latest  | Core backend authentication / token verification       |
| JWT              | @nestjs/jwt                        | latest  | Access + refresh token signing (RS256)                 |
| Password Hashing | bcrypt                             | 5.x     | saltRounds=12                                          |
| Validation       | nestjs-zod                         | latest  | DTO validation pipe using shared mono-repo Zod schemas |
| API Docs         | @nestjs/swagger                    | latest  | Auto-generated Swagger UI at `/api/docs`               |
| File Storage     | MinIO SDK                          | latest  | S3-compatible object storage                           |
| Email            | Nodemailer + Handlebars            | latest  | Transactional email with templates                     |
| SMS              | Twilio SDK / BD SSLCOMMERZ gateway | latest  | OTP and alerts                                         |
| PDF Generation   | Puppeteer                          | 21.x    | Payslips, invoices, reports                            |
| Excel Export     | ExcelJS                            | 4.x     | XLSX report exports                                    |
| Logging          | Pino                               | 9.x     | Structured JSON logging                                |
| Error Tracking   | Sentry Node SDK                    | 8.x     | Backend exception monitoring                           |
| Scheduling       | @nestjs/schedule                   | latest  | Cron-triggered jobs                                    |
| Config           | @nestjs/config + Joi               | latest  | Env validation at boot                                 |
| Throttling       | @nestjs/throttler                  | latest  | Rate limiting per IP and API key (Redis store)         |
| Health Check     | @nestjs/terminus                   | latest  | `/health` endpoint                                     |
| Testing          | Jest + Supertest                   | latest  | Unit + integration + API tests                         |
| DB Migration CLI | TypeORM CLI                        | 0.3.x   | `typeorm migration:run`                                |

### 1.3 Infrastructure & DevOps

| Category           | Technology                            | Purpose                               |
| ------------------ | ------------------------------------- | ------------------------------------- |
| Containerization   | Docker + Docker Compose               | Local dev and production packaging    |
| Orchestration      | Kubernetes + Helm                     | Production cluster management         |
| CI/CD              | GitHub Actions                        | Lint → Test → Build → Deploy pipeline |
| Reverse Proxy      | Nginx                                 | SSL termination, static assets        |
| SSL                | Let's Encrypt + cert-manager          | Automated TLS certificates            |
| Secret Management  | HashiCorp Vault / AWS Secrets Manager | Production secrets                    |
| Metrics            | Prometheus + Grafana                  | Resource and application metrics      |
| Logs               | Loki + Grafana                        | Centralized log aggregation           |
| Tracing            | OpenTelemetry + Jaeger                | Distributed request tracing           |
| Error Tracking     | Sentry                                | Frontend + backend error monitoring   |
| Uptime             | Better Uptime                         | Alerting and status page              |
| DB Connection Pool | PgBouncer                             | PostgreSQL connection pooling         |
| Object Storage     | MinIO                                 | File and document storage             |

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
  error: "#ffb4ab", // Error state
  error_container: "#93000a", // Error background
  success: "#6dd58c", // Success state
  warning: "#ffb347", // Warning state

  // Logo-derived
  brand_navy: "#1B2A4A", // Logo dark face
  brand_slate: "#6B7FA3", // Logo mid face
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
  // NO hard 1px borders — use surface tier shifts instead
  // Exception: ghost border at 15% opacity only
  ghost_border: "rgba(61, 74, 99, 0.15)",

  // Floating elements: glassmorphism
  glass: {
    background: "rgba(26, 34, 53, 0.6)",
    backdropFilter: "blur(20px)",
  },

  // Ambient shadow (tinted, never grey)
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
    // Brand colors
    colorPrimary:        '#c3f5ff',
    colorPrimaryHover:   '#80d8ff',
    colorPrimaryActive:  '#00e5ff',

    // Backgrounds mapped to Deep Space palette
    colorBgBase:         '#0c1324',
    colorBgContainer:    '#1a2235',
    colorBgElevated:     '#222c42',
    colorBgLayout:       '#111827',
    colorBgSpotlight:    '#2e3447',

    // Text
    colorText:           '#e8eaf0',
    colorTextSecondary:  '#9aa5be',
    colorTextTertiary:   '#e3eeff',
    colorTextDisabled:   'rgba(232,234,240,0.3)',

    // Borders — ghost only
    colorBorder:         'rgba(61,74,99,0.15)',
    colorBorderSecondary:'rgba(61,74,99,0.10)',
    colorSplit:          'rgba(61,74,99,0.12)',

    // Semantic
    colorError:          '#ffb4ab',
    colorSuccess:        '#6dd58c',
    colorWarning:        '#ffb347',
    colorInfo:           '#c3f5ff',

    // Typography
    fontFamily:          '"Manrope", -apple-system, sans-serif',
    fontSize:            14,
    fontSizeLG:          16,
    fontSizeSM:          12,
    fontSizeHeading1:    28,
    fontSizeHeading2:    22,
    fontSizeHeading3:    18,

    // Shape
    borderRadius:        4,     // 0.25rem — DEFAULT, precision look
    borderRadiusLG:      6,
    borderRadiusSM:      2,
    borderRadiusXS:      2,

    // Spacing
    padding:             16,
    paddingLG:           24,
    paddingSM:           8,
    marginLG:            24,

    // Motion
    motionDurationMid:   '0.2s',
    motionDurationSlow:  '0.3s',

    // Shadow — ambient tinted
    boxShadow:           '0px 8px 24px rgba(7,13,31,0.3)',
    boxShadowSecondary:  '0px 4px 12px rgba(7,13,31,0.2)',
  },
  components: {
    Layout: {
      siderBg:           '#111827',
      headerBg:          'rgba(17,24,39,0.7)',  // glassmorphism nav
      bodyBg:            '#0c1324',
      triggerBg:         '#1a2235',
    },
    Menu: {
      darkItemBg:          '#111827',
      darkSubMenuItemBg:   '#0c1324',
      darkItemSelectedBg:  'rgba(195,245,255,0.08)',
      darkItemSelectedColor:'#c3f5ff',
      darkItemColor:       '#9aa5be',
      darkItemHoverColor:  '#e8eaf0',
      darkItemHoverBg:     'rgba(195,245,255,0.05)',
      iconSize:            16,
    },
    Table: {
      colorBgContainer:     '#111827',          // base table bg
      headerBg:             '#0c1324',          // header = deepest layer
      rowHoverBg:           '#222c42',
      borderColor:          'transparent',      // No borders — use stripe instead
      colorTextHeading:     '#9aa5be',
      fontSize:             13,
    },
    Card: {
      colorBgContainer:     '#1a2235',
      paddingLG:             24,
      borderRadiusLG:        4,
    },
    Button: {
      primaryColor:         '#003c4a',          // on_primary
      defaultBg:            'transparent',
      defaultBorderColor:   'rgba(195,245,255,0.2)',
      defaultColor:         '#c3f5ff',
    },
    Input: {
      colorBgContainer:     '#2e3447',
      activeBorderColor:    '#c3f5ff',
      hoverBorderColor:     'rgba(195,245,255,0.4)',
      activeShadow:         '0 0 0 2px rgba(195,245,255,0.1)',
    },
    Select: {
      colorBgContainer:     '#2e3447',
      optionSelectedBg:     'rgba(195,245,255,0.08)',
    },
    Modal: {
      contentBg:            'rgba(26,34,53,0.6)',   // glassmorphism
      headerBg:             'transparent',
      footerBg:             'transparent',
    },
    Drawer: {
      colorBgElevated:      'rgba(17,24,39,0.85)',
    },
    DatePicker: {
      colorBgContainer:     '#2e3447',
    },
    Badge: {
      colorBgContainer:     '#c3f5ff',
      colorText:            '#003c4a',
    },
    Tag: {
      defaultBg:            'rgba(195,245,255,0.1)',
      defaultColor:         '#c3f5ff',
    },
    Statistic: {
      titleFontSize:        12,
      contentFontSize:      28,
    },
    Tabs: {
      inkBarColor:          '#c3f5ff',
      itemSelectedColor:    '#c3f5ff',
      itemHoverColor:       '#e8eaf0',
      itemColor:            '#9aa5be',
    },
    Steps: {
      colorPrimary:         '#c3f5ff',
      colorText:            '#e8eaf0',
    },
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
import { NextIntlClientProvider } from 'next-intl'
import { Space_Grotesk, Manrope } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700', '800'],
})

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

### 3.3 Antd CSS Variables Override

```css
/* apps/web/app/globals.css */

/* Import fonts */
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Manrope:wght@300..800&display=swap");

/* CSS custom properties for design tokens */
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

/* Utility: KPI numbers always use display font */
.font-display {
  font-family: var(--font-display);
}

/* Glassmorphism modal backdrop */
.nurox-modal-content {
  backdrop-filter: blur(20px) !important;
}

/* Primary button gradient */
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

/* Table alternating row stripes (no borders) */
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

### 3.4 Antd Table Wrapper (TanStack + Antd styling)

```typescript
// components/tables/DataTable.tsx
'use client'
import { Table, type TableProps } from 'antd'
import type { ColumnType } from 'antd/es/table'

// Use Ant Design Table directly for all standard ERP tables.
// TanStack Table is used ONLY for advanced client-side filtering/sorting
// on large virtualized datasets (10k+ rows) via VirtualTable.tsx.

interface DataTableProps<T> extends TableProps<T> {
  loading?: boolean
}

export function DataTable<T extends object>({ loading, ...props }: DataTableProps<T>) {
  return (
    <Table
      {...props}
      loading={loading}
      size="middle"
      scroll={{ x: 'max-content' }}
      pagination={{
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        defaultPageSize: 25,
        pageSizeOptions: ['10', '25', '50', '100'],
      }}
      style={{ background: 'transparent' }}
    />
  )
}
```

---

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

/**
 * Login — sends credentials to NestJS backend, returns tokens + user.
 * Access token is stored in Redux (memory). Refresh token is set as
 * httpOnly cookie by the NestJS backend (never exposed to JS).
 */
export async function login(credentials: LoginDto): Promise<AuthResponseDto> {
  const parsed = loginSchema.parse(credentials);
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // sends/receives httpOnly cookies
    body: JSON.stringify(parsed),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }
  return res.json();
}

/**
 * Refresh — calls backend with httpOnly refresh cookie.
 * Backend validates the cookie and returns new access + refresh tokens.
 */
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

/**
 * Logout — invalidates refresh token on backend, clears httpOnly cookie.
 */
export async function logout(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
```

### 5.2 Next.js 16 Middleware (Route Protection via JWT Cookie)

```typescript
// apps/web/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // Check for refresh token cookie (httpOnly, set by NestJS backend)
  const refreshToken = request.cookies.get("nurox_refresh_token");

  if (!refreshToken?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Maintenance mode: set 'maintenance_mode' key in Redis via admin panel.
  // middleware.ts reads this flag via the NestJS health/settings endpoint
  // rather than importing Redis directly (keeps the frontend Redis-free).

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
    "Payroll",
    "Leave",
    "Attendance",
    "Candidate",
    "Invoice",
    "Bill",
    "Product",
    "PurchaseOrder",
    "Lead",
    "Opportunity",
    "Project",
    "Task",
    "Asset",
    "Document",
    "Notification",
    "User",
    "Role",
    "Setting",
  ],
  endpoints: () => ({}),
});
```

### 5.4 Fetch Base Query (reads token from Redux store)

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
  credentials: "include", // sends httpOnly refresh cookie
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

/**
 * Wrapper that intercepts 401s, attempts a silent token refresh via
 * httpOnly cookie, and retries the original request once.
 */
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
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return result;
};
```

````

### 5.5 React Hook Form + Zod + Ant Design Pattern

```typescript
// components/forms/RhfInput.tsx
'use client'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Form, Input, type InputProps } from 'antd'

interface RhfInputProps<T extends FieldValues> extends InputProps {
  control: Control<T>
  name: FieldPath<T>
  label: string
  required?: boolean
}

export function RhfInput<T extends FieldValues>({
  control, name, label, required, ...inputProps
}: RhfInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Form.Item
          label={<span style={{ color: 'var(--color-on-surface-variant)', fontSize: 12, letterSpacing: '0.04em' }}>{label}</span>}
          validateStatus={fieldState.error ? 'error' : ''}
          help={fieldState.error?.message}
          required={required}
          style={{ marginBottom: 20 }}
        >
          <Input {...field} {...inputProps} />
        </Form.Item>
      )}
    />
  )
}
````

### 5.6 antd Global Message Instance

```typescript
// apps/web/lib/antd-message.ts
// Used in non-component contexts (RTK Query mutation callbacks, etc.)
// Eliminates the need to call message.useMessage() in every component.
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

### 5.7 usePermission Hook

```typescript
// apps/web/hooks/usePermission.ts
import { useSession } from "next-auth/react";

export function usePermission(permission: string): boolean {
  const { data: session } = useSession();
  return session?.user?.permissions?.includes(permission) ?? false;
}

// Usage:
// const canWrite = usePermission('hr:employees:write')
// const canApprove = usePermission('payroll:runs:approve')
```

### 5.8 Dashboard Layout with Ant Design

```typescript
// app/(dashboard)/layout.tsx
'use client'
import { Layout, Menu } from 'antd'
import { usePathname } from 'next/navigation'
import { LogoMark } from '@/components/shared/LogoMark'
import { TopBar } from '@/components/layout/TopBar'
import { sidebarItems } from '@/lib/sidebar-items'

const { Sider, Header, Content } = Layout

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sider
        width={240}
        style={{
          background: '#111827',
          position: 'fixed',
          height: '100vh',
          left: 0, top: 0,
          borderRight: '1px solid rgba(61,74,99,0.15)',
        }}
        collapsible
      >
        <div style={{ padding: '20px 16px 12px' }}>
          <LogoMark />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={sidebarItems}
          style={{ background: 'transparent', border: 'none' }}
        />
      </Sider>

      <Layout style={{ marginLeft: 240 }}>
        <Header style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(17,24,39,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(61,74,99,0.15)',
          padding: '0 24px',
        }}>
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
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });

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

@Entity("employees")
@Index(["tenantId", "employeeCode"], { unique: true })
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id" })
  tenantId: string;

  @Column({ name: "employee_code", length: 20 })
  employeeCode: string;

  @Column({ name: "first_name", length: 100 })
  firstName: string;

  @Column({ name: "last_name", length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

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

  @ManyToOne(() => Employee, { nullable: true })
  manager: Employee;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;
}
```

### 6.3 Shared Zod Schemas

```typescript
// packages/zod-schemas/src/hr/employee.schema.ts
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

---

## 7. Feature Modules

### Module 1: Core Platform & Infrastructure

- [ ] Schema-per-tenant isolation in PostgreSQL (`SchemaNamespace` via TypeORM)
- [ ] `TenantMiddleware` resolves `tenantId` from `x-tenant-id` header (set by middleware.ts)
- [ ] All service layer queries scoped by `tenantId` field
- [ ] Custom subdomain routing in middleware.ts (`acme.nurox.app` → inject `x-tenant-id`)
- [ ] Tenant provisioning workflow with default roles and permission seed
- [ ] Tenant feature toggle in `tenant_modules` table (enable/disable modules per tenant)
- [ ] `next-intl` with locale in URL segment: `/en/`, `/bn/` (Bengali), `/ar/` (Arabic RTL)
- [ ] RTL layout support: CSS logical properties + `direction: rtl` on `<html>` for `ar`
- [ ] Light / Dark mode — antd `algorithm` toggle between `darkAlgorithm` / `defaultAlgorithm`
- [ ] Tenant branding: logo + primary color override injected into antd `ConfigProvider` per session
- [ ] Fully responsive layout using antd Grid + Tailwind breakpoints
- [ ] WCAG 2.1 AA — antd components are ARIA-accessible by default; verify focus rings and keyboard nav
- [ ] Skeleton loaders using antd `Skeleton` on all RTK Query `isLoading` states
- [ ] Global command palette (⌘K) using `cmdk` with antd styling overlay
- [ ] Breadcrumbs via antd `Breadcrumb`, auto-generated from Next.js App Router segment config

### Module 2: Authentication & Authorization

- [ ] `lib/auth.ts` — Custom JWT helpers (login, refresh, logout) calling NestJS backend
- [ ] `AuthProvider.tsx` — Auth context storing access token in Redux (memory), refresh token as httpOnly cookie
- [ ] NestJS: `POST /api/v1/auth/login` → returns `accessToken` (15 min RS256), `refreshToken` (7 days)
- [ ] `jwt` callback: transparent access token refresh before expiry via `POST /api/v1/auth/refresh`
- [ ] Refresh token rotation — new token on every refresh; family reuse triggers full invalidation
- [ ] `signOut()` calls `POST /api/v1/auth/logout` to invalidate refresh token in Redis
- [ ] OAuth 2.0: Google + Microsoft via NestJS Passport strategies (provider endpoints on backend)
- [ ] TOTP 2FA: `speakeasy` QR enrollment + 6-digit verify on NestJS
- [ ] 2FA backup codes (hashed, one-time use)
- [ ] Passwordless magic link (10 min JWT) via email
- [ ] Forgot/reset password flow with signed link (15 min expiry, invalidated after use)
- [ ] Active session list with device/IP info, individual revoke
- [ ] Account lockout: 5 failed attempts / 15 min — Redis TTL-backed
- [ ] System roles: `SUPER_ADMIN`, `ADMIN`, `HR_MANAGER`, `MANAGER`, `EMPLOYEE`, `VIEWER`
- [ ] Custom role builder with permission nodes per module (e.g., `hr:employees:write`)
- [ ] `@Permissions('hr:employees:write')` decorator + `PermissionsGuard` on NestJS endpoints
- [ ] middleware.ts route protection — unauthenticated → redirect to `/login?callbackUrl=...`
- [ ] `usePermission(permission)` hook reads from Redux auth slice permissions
- [ ] Conditional UI rendering via `usePermission` (hide buttons/columns based on role)

### Module 3: User & Organization Management

- [ ] User CRUD with antd Form + RHF
- [ ] Profile photo upload: antd Upload → NestJS pre-signed MinIO URL → direct S3 PUT
- [ ] Bulk user CSV import: antd Upload → row-by-row Zod validation → error report antd Table
- [ ] User statuses: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING_INVITE` — antd Tag with StatusTag component
- [ ] Invite-by-email: signed one-time token link (48h expiry)
- [ ] Force password change flag on first login
- [ ] Company profile: logo, name, address, tax registration
- [ ] Multi-branch with address and timezone per branch
- [ ] Department CRUD with parent (TypeORM closure table → recursive antd TreeSelect)
- [ ] Visual org chart (`react-d3-tree` styled to Deep Space palette)
- [ ] Cost center assignment per department

### Module 4: Dashboard & Analytics

- [ ] Personalized widget layout with `@dnd-kit/core` drag-and-drop reorder
- [ ] Widget preferences persisted to `user_preferences` table
- [ ] KPI cards using antd `Statistic` with Space Grotesk font + Electric Cyan accent
- [ ] Real-time KPI updates via Socket.io subscription
- [ ] Date range filter: antd `RangePicker`
- [ ] Recharts charts themed to Deep Space: Bar, Line, Pie, Area
- [ ] Quick action button: antd `FloatButton.Group`
- [ ] Recent activity feed from `audit_logs` table
- [ ] Alerts panel: RTK Query polling `/alerts` every 60 seconds
- [ ] RSC shell + Client Component widgets for optimal performance

### Module 5: Human Resources

- [ ] New hire multi-step wizard: antd `Steps` + `Form`, Zod schema per step
- [ ] Employment types: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERN`, `PROBATION`
- [ ] Probation period tracking: BullMQ job triggers notification at expiry
- [ ] Contract file upload (antd Upload → MinIO) with expiry reminder cron
- [ ] Employment history timeline: antd `Timeline` component
- [ ] Salary revision history with effective date
- [ ] Increment/promotion approval workflow
- [ ] Transfer, termination, resignation flows with clearance checklist
- [ ] OKR-style goal setting with progress tracking
- [ ] 360° review cycles: self, peer, manager ratings
- [ ] PIP workflow with documentation
- [ ] Training catalog + enrollment management
- [ ] Skill matrix per employee
- [ ] Training certificate PDF via Puppeteer

### Module 6: Payroll Management

- [ ] Salary structure builder: base, HRA, transport, medical, deductions
- [ ] Payroll run lifecycle: `DRAFT` → `REVIEW` → `APPROVED` → `PROCESSED`
- [ ] Gross/net auto-computation in NestJS `payroll-compute.service.ts`
- [ ] Tax bracket config per fiscal year (BD TIN compliant)
- [ ] BEFTN bank file export (tab-delimited per Bangladesh standard)
- [ ] PF contribution computation (employee + employer %)
- [ ] Overtime hours pulled from `attendance_records`
- [ ] Bonus/incentive as separate payroll component
- [ ] Arrear calculation for backdated revisions
- [ ] Payslip PDF via Puppeteer (company letterhead template)
- [ ] Employee self-service payslip download (RTK Query + MinIO presigned URL)
- [ ] Payroll journal auto-posting to Finance module via `EventEmitter2`
- [ ] Full payroll audit trail

### Module 7: Attendance & Leave

- [ ] Manual HR entry + bulk CSV import
- [ ] QR code check-in: JWT-signed QR → NestJS verify → `attendance_records`
- [ ] ZKTeco biometric bridge: Node.js TCP client polls device, syncs to DB
- [ ] Geo-fenced check-in: HTML5 Geolocation → NestJS radius validation
- [ ] Shift management: `MORNING`, `EVENING`, `NIGHT`, `ROTATING`
- [ ] Overtime auto-flag when clock-out exceeds shift end by configurable minutes
- [ ] Monthly attendance report: antd Table + ExcelJS export
- [ ] Leave type config: Annual, Sick, Casual, Maternity, Paternity, Unpaid, Compensatory
- [ ] Leave balance per employee per fiscal year (`leave_balances` table)
- [ ] Carry-forward rules with max days + expiry
- [ ] Leave application → manager → HR approval workflow
- [ ] Delegation: auto-escalate when manager is on leave
- [ ] Team calendar view: antd `Calendar` custom cell render
- [ ] Clash detection alerts
- [ ] Public holiday table per branch
- [ ] Leave encashment calculation in payroll run

### Module 8: Recruitment & Onboarding

- [ ] Job requisition with approval chain: `DRAFT` → `APPROVED` → `OPEN` → `CLOSED`
- [ ] ATS Kanban: `@dnd-kit` columns (Applied → Screened → Interview → Offer → Hired)
- [ ] Candidate profile + resume upload (antd Upload → MinIO)
- [ ] Interview scheduling with antd `DatePicker` + Google Calendar webhook
- [ ] Interview feedback form (RHF + Zod + antd Form)
- [ ] Offer letter via Puppeteer (Handlebars template)
- [ ] Rejection email automation via BullMQ `email` queue
- [ ] Digital onboarding checklist with progress tracker
- [ ] Document collection portal (NID, TIN, bank details → MinIO via antd Upload)
- [ ] E-signature: HTML5 Canvas → PNG → overlaid on PDF via Puppeteer
- [ ] Auto-trigger: create user, assign roles, send credentials on checklist completion

### Module 9: Finance & Accounting

- [ ] Hierarchical Chart of Accounts (TypeORM adjacency list → antd Tree)
- [ ] Multi-currency with base currency conversion
- [ ] Manual journal entry: RHF multi-line debit/credit, Zod `.refine()` balance check
- [ ] Double-entry enforcement: `sum(debits) === sum(credits)`
- [ ] Auto journals from payroll, sales invoice, vendor bill, asset depreciation
- [ ] General ledger drill-down: antd Table with lazy loading
- [ ] Trial balance generation
- [ ] Period closing with soft-lock on `accounting_periods`
- [ ] Customer invoice: `DRAFT` → `SENT` → `PARTIALLY_PAID` → `PAID` → `OVERDUE` → `VOID`
- [ ] Automated AR reminder emails via BullMQ
- [ ] AR aging report: 0-30, 31-60, 61-90, 90+ day buckets
- [ ] Vendor bill management + 3-way matching (PO × GRN × Bill)
- [ ] Bank statement CSV/OFX upload → transaction matching → reconciliation
- [ ] VAT/GST rate configuration
- [ ] Income Statement, Balance Sheet, Cash Flow reports
- [ ] Budget vs Actual variance report
- [ ] All reports: PDF (Puppeteer) + XLSX (ExcelJS)

### Module 10: Inventory Management

- [ ] Multi-warehouse: warehouse → zone → rack → bin hierarchy
- [ ] Product catalog: SKU, barcode, UOM, category, tax class, MinIO images
- [ ] Product variants: size/color/batch
- [ ] Stock receipt, issue, transfer → `stock_movements` records
- [ ] Stock adjustment with mandatory reason code
- [ ] FIFO / LIFO / Weighted Average valuation
- [ ] Reorder point alerts via BullMQ daily check
- [ ] Batch/lot + serial number tracking
- [ ] Expiry date tracking with FEFO dispatch suggestion
- [ ] Physical stock count workflow → count sheet → actuals → adjustment
- [ ] Inventory aging analysis

### Module 11: Procurement & Purchase

- [ ] Vendor master with KYC, payment terms, currency
- [ ] PR → RFQ → PO → GRN workflow
- [ ] Multi-vendor RFQ with auto-comparison table
- [ ] PO PDF emailed to vendor via Puppeteer + Nodemailer
- [ ] PO amendment with version history
- [ ] Partial and full GRN receipt → auto-updates inventory via TypeORM transaction
- [ ] 3-way matching with mismatch alert
- [ ] Vendor credit limit check at PO creation
- [ ] Purchase return → Debit Note
- [ ] Landed cost allocation (freight, duties) across received items
- [ ] Vendor scorecard + spend analytics (Recharts)

### Module 12: Sales & CRM

- [ ] Lead capture: manual + public form + inbound webhook
- [ ] Lead scoring with configurable point weights
- [ ] Opportunity pipeline: `@dnd-kit` Kanban + antd Table list view
- [ ] Contact and company (account) management
- [ ] Activity log: calls, emails, meetings, notes
- [ ] Quotation builder with RHF line items, discount, tax
- [ ] Quotation → Sales Order conversion
- [ ] SO approval workflow
- [ ] Delivery order with partial delivery support
- [ ] Customer invoice auto-generated from delivery confirmation
- [ ] Tiered pricing and time-limited promotions
- [ ] Salesperson commission computation
- [ ] Sales return → Credit Note → inventory adjustment
- [ ] Sales analytics: Recharts revenue by rep/region/period

### Module 13: Project Management

- [ ] Project entity: client, budget, start/end, currency
- [ ] Milestone tracking with completion %
- [ ] Task with priority, status, assignee, estimated hours
- [ ] Sub-task nesting (3 levels, TypeORM closure table)
- [ ] Kanban board via `@dnd-kit`
- [ ] Gantt chart (`react-gantt-chart` or `dhtmlx-gantt`)
- [ ] Manual timer + stop/start time logging per task
- [ ] Budget vs actual: logged hours × hourly rate
- [ ] Billable hours → Finance invoice line items
- [ ] Team workload heatmap
- [ ] Project health KPIs: scope creep %, schedule variance, cost variance

### Module 14: Asset Management

- [ ] Asset register: category, purchase date, cost, location, assigned employee
- [ ] Lifecycle: `PURCHASED` → `ACTIVE` → `UNDER_MAINTENANCE` → `DISPOSED`
- [ ] Depreciation: Straight-Line or Declining Balance
- [ ] Depreciation run → auto journal to Finance via `EventEmitter2`
- [ ] Asset assignment/return in `asset_assignments` table
- [ ] Maintenance log with technician notes + cost
- [ ] Scheduled preventive maintenance via BullMQ cron
- [ ] Warranty and insurance expiry alerts
- [ ] Physical verification checklist
- [ ] Disposal with NBV and gain/loss journal

### Module 15: Document Management

- [ ] Folder + tag-based organization (TypeORM recursive tree → antd Tree)
- [ ] File upload: antd Upload → NestJS pre-signed MinIO URL → direct S3 PUT
- [ ] Accepted types: PDF, DOCX, XLSX, PNG, JPG (Zod MIME validation)
- [ ] Document versioning: each upload = new `document_version` record
- [ ] Access control: `PUBLIC`, `DEPARTMENT`, `OWNER_ONLY`, `ROLE_RESTRICTED`
- [ ] E-signature: HTML5 Canvas → PNG → overlaid on PDF via Puppeteer
- [ ] Sequential/parallel approval routing
- [ ] Expiry tracking with BullMQ reminder
- [ ] Document audit trail in `document_access_logs`

### Module 16: Notification & Communication

- [ ] In-app notification center: antd `Popover` + `Badge` with unread count
- [ ] Real-time: Socket.io `@WebSocketGateway` — room per tenant + user
- [ ] Email: Nodemailer + Handlebars, queued via BullMQ `email` worker
- [ ] SMS: Twilio / SSLCOMMERZ gateway, queued via BullMQ `sms` worker
- [ ] Notification preference settings per user
- [ ] Template management with `{{variable}}` substitution
- [ ] Daily digest email via BullMQ cron
- [ ] Announcement broadcast: admin → `notification_broadcasts` → fan-out by role
- [ ] `@mention` in Tiptap triggers push notification to mentioned user

### Module 17: Audit Logs & Compliance

- [ ] Immutable `audit_logs` table — TypeORM subscriber auto-captures entity changes
- [ ] Fields: `actor_id`, `entity_type`, `entity_id`, `action`, `old_value (JSONB)`, `new_value (JSONB)`, `ip_address`, `user_agent`, `created_at`
- [ ] Module log viewer: antd Table with filter + pagination
- [ ] XLSX/JSON export of audit logs
- [ ] Data retention TTL per module (BullMQ cleanup cron)
- [ ] GDPR export: `/admin/gdpr/export/:userId` → ZIP of all personal data
- [ ] GDPR erasure: anonymize PII, preserve financial records
- [ ] Login events with `geoip-lite` city/country display
- [ ] Anomaly alerts: bulk delete > N rows, login from new country

### Module 18: Reporting & Exports

- [ ] Report builder: select entity, columns, filters, grouping — saved as JSON in DB
- [ ] Saved report templates (personal or team-shared)
- [ ] Scheduled delivery: BullMQ cron → generate → email attachment
- [ ] PDF: Puppeteer renders Next.js report route, streams to client
- [ ] XLSX: ExcelJS with column formatting + summary rows
- [ ] CSV: NestJS streaming response for large datasets
- [ ] Standard reports: HR summary, Payroll register, Stock valuation, AR aging, etc.
- [ ] Report access control by role

### Module 19: System Administration

- [ ] Module enable/disable toggle per tenant
- [ ] Password policy: min length, complexity, expiry — Zod validated
- [ ] MFA enforcement flag per tenant in `tenant_settings`
- [ ] SMTP configuration override per tenant
- [ ] Fiscal year and currency setup
- [ ] Auto-number sequences per document type
- [ ] Custom fields builder: `VARCHAR`/`BOOLEAN`/`DATE`/`NUMBER` via `custom_field_definitions`
- [ ] DB backup: `pg_dump` via BullMQ cron → MinIO
- [ ] Health dashboard: DB pool, Redis memory, queue depths
- [ ] BullMQ Bull Board at `/admin/queues` (role-protected)
- [ ] Feature flag service per tenant (Redis with DB fallback)
- [ ] Maintenance mode: Redis flag → NestJS settings endpoint → middleware.ts returns 503

### Module 20: API & Integration Layer

- [ ] RESTful API + Swagger UI at `/api/docs`
- [ ] API versioning: `/api/v1/`, `/api/v2/`
- [ ] API key management with hash-stored keys, scoped permissions, expiry
- [ ] Outbound webhooks: entity events → BullMQ with retry + exponential backoff
- [ ] Webhook delivery log + manual replay in admin UI
- [ ] Inbound webhooks: SSLCommerz + Stripe — HMAC signature verified
- [ ] Rate limiting: `@nestjs/throttler` Redis store per IP and API key
- [ ] Slack integration: webhook notifications
- [ ] Google Calendar sync for leave/interview events
- [ ] Bulk import/export with streaming + progress token polling

### Module 21: Security Hardening

- [ ] HTTPS enforced — HSTS via Nginx (`max-age=31536000; includeSubDomains`)
- [ ] CORS: strict origin whitelist in NestJS CORS config
- [ ] Helmet.js: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] All DB queries via TypeORM QueryBuilder (parameterized — no raw string concat)
- [ ] Input sanitization: `sanitize-html` on backend DTOs + DOMPurify on Tiptap frontend output
- [ ] CSRF: SameSite=Strict on httpOnly refresh cookie + CSRF token double-submit pattern on state-changing flows
- [ ] File upload: MIME type + magic byte validation in NestJS interceptor + ClamAV hook
- [ ] Auth rate limit: 5 failed attempts / 15 min per IP via Redis
- [ ] Secrets: `@nestjs/config` + Joi at boot; HashiCorp Vault in production
- [ ] `npm audit` + Snyk scan in CI — fail on critical CVEs
- [ ] PII fields encrypted at rest: TypeORM `@Column` transformer with AES-256-GCM
- [ ] PostgreSQL volume encryption (LUKS / provider-managed)
- [ ] `JWT_ACCESS_SECRET` — RS256 private key for access token signing
- [ ] `JWT_REFRESH_SECRET` — Separate secret for refresh token signing
- [ ] OWASP Top 10 test checklist per major release

### Module 22: DevOps & Deployment

- [ ] `pr.yml`: ESLint, Prettier, TypeScript compile, unit tests on every PR
- [ ] `deploy.yml`: Docker build → GHCR push → K8s rolling deploy on merge to `main`
- [ ] TypeORM migration auto-run as K8s init container before API pod starts
- [ ] `husky` + `lint-staged`: ESLint + Prettier + Zod schema check pre-commit
- [ ] Multi-stage Dockerfiles: builder → production (no dev deps)
- [ ] `docker-compose.yml`: Next.js, NestJS, PostgreSQL 18, Redis, MinIO, MailHog, Bull Board
- [ ] Health check in Dockerfiles (`HEALTHCHECK CMD curl -f /health`)
- [ ] Non-root user in all containers
- [ ] Helm chart: deployment, service, ingress, HPA templates
- [ ] HPA on NestJS API: CPU > 70% → scale out
- [ ] Nginx Ingress + `cert-manager` + Let's Encrypt
- [ ] ConfigMaps for non-secret env; Secrets for credentials
- [ ] Pino structured JSON logs with `correlationId`
- [ ] Loki + Grafana log aggregation
- [ ] Prometheus `/metrics` + Grafana dashboards
- [ ] Sentry: `sentry.client.config.ts` (Next.js) + global filter (NestJS)
- [ ] OpenTelemetry traces → Jaeger
- [ ] Better Uptime monitors on `/health` and `/api/v1/health`
- [ ] Vitest unit tests (≥70% coverage threshold)
- [ ] Playwright E2E: login, create employee, run payroll, create invoice, approve leave
- [ ] Testcontainers for NestJS integration tests with real PostgreSQL

---

## 8. Appendices

### Appendix A — Module Dependency Map

```
Authentication (Custom JWT — Passport.js backend + Redux frontend)
    └── User & Org Management
            ├── HR ──────────────── Payroll ←── Attendance
            │       └── Recruitment            └── Leave
            ├── Finance
            │       ├── AR ←── Sales & CRM ←── Inventory
            │       └── AP ←── Procurement ←── Inventory
            ├── Projects ──────────────────────── Finance (billing)
            └── Assets ────────────────────────── Finance (depreciation)

All Modules → Audit Logs → Reporting → Export (PDF / XLSX / CSV)
All Modules → Notification System (Socket.io, Email, SMS)
All Modules → Document Management
All Modules → Custom Fields (custom_field_definitions)
```

### Appendix B — TypeORM Migration Workflow

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

### Appendix C — Environment Variables

```bash
# ── apps/web/.env.local ───────────────────────────────────────────────

# Auth
NEXT_PUBLIC_API_URL=http://localhost:3001  # Client-side (RTK Query fetchBaseQuery)
API_URL=http://localhost:3001              # Server-side calls (if needed)

# OAuth providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# next-intl
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

```bash
# ── apps/api/.env ─────────────────────────────────────────────────────

# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/nurox_erp
DATABASE_SCHEMA=public

# Redis
REDIS_URL=redis://localhost:6379

# JWT (RS256)
JWT_ACCESS_SECRET=                     # RS256 private key or secret
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=900                  # 15 min in seconds
JWT_REFRESH_EXPIRY=604800              # 7 days

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=nurox-erp

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# SMS
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_FROM=

# Sentry
SENTRY_DSN=

# Frontend (for CORS)
FRONTEND_URL=https://nurox.app
```

### Appendix D — Docker Compose (Local Dev)

```yaml
# infra/docker/docker-compose.yml
# Note: 'version' key is obsolete in Docker Compose v2+ and intentionally omitted.

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
    depends_on: [postgres, redis, minio]

  postgres:
    image: postgres:17-alpine
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

  mailhog:
    image: mailhog/mailhog
    ports: ["1025:1025", "8025:8025"] # 8025 = Web UI

  bullboard:
    image: deadly0/bull-board
    ports: ["3002:3000"]
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379

volumes:
  pgdata:
  miniodata:
```

### Appendix E — Permissions Reference

```
Format: module:resource:action

HR
  hr:employees:read       hr:employees:write      hr:employees:delete
  hr:departments:read     hr:departments:write
  hr:performance:read     hr:performance:write

Payroll
  payroll:runs:read       payroll:runs:write      payroll:runs:approve
  payroll:structures:read payroll:structures:write
  payroll:payslips:read

Attendance & Leave
  attendance:records:read attendance:records:write
  leave:requests:read     leave:requests:write    leave:requests:approve

Finance
  finance:journals:read   finance:journals:write  finance:journals:approve
  finance:invoices:read   finance:invoices:write
  finance:reports:read

Inventory
  inventory:products:read inventory:products:write
  inventory:stock:read    inventory:stock:write

Procurement
  procurement:po:read     procurement:po:write    procurement:po:approve
  procurement:grn:read    procurement:grn:write

Sales
  sales:leads:read        sales:leads:write
  sales:orders:read       sales:orders:write      sales:orders:approve

Projects
  projects:read           projects:write
  projects:tasks:read     projects:tasks:write

Admin
  admin:users:read        admin:users:write       admin:users:delete
  admin:roles:read        admin:roles:write
  admin:settings:read     admin:settings:write
  admin:audit:read
```

---

_Nurox ERP Documentation — April 2026_
_Stack: Next.js 16 · NestJS 11 · Ant Design 6 · TypeORM 0.3 · PostgreSQL 18 · Redux Toolkit + RTK Query · React Hook Form · Zod 4 · Custom JWT Auth (Passport.js) · Redis · BullMQ · Docker · Kubernetes_
_Design System: Liquid Precision — "The Architectural Infinite" · Deep Space Palette · Space Grotesk + Manrope_
_Total feature count: ~355 items across 22 modules_
