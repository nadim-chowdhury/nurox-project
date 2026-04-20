# Nurox ERP — Data Dictionary & Schema

> **Standard:** ISO 20022 (Finance), ISO 8601 (Dates), UTC Timezone
> **Naming:** `snake_case` for columns, `camelCase` for TypeScript properties

## 1. Core & Multi-Tenancy

### `tenants`

| Column        | Type           | Constraints                      | Description                         |
| :------------ | :------------- | :------------------------------- | :---------------------------------- |
| `id`          | `UUID`         | PK, Default `uuid_generate_v4()` | Unique tenant ID                    |
| `name`        | `VARCHAR(255)` | NOT NULL                         | Registered company name             |
| `slug`        | `VARCHAR(100)` | UNIQUE, NOT NULL                 | Subdomain identifier (e.g., `acme`) |
| `schema_name` | `VARCHAR(63)`  | UNIQUE, NOT NULL                 | Postgres schema name for isolation  |
| `status`      | `ENUM`         | 'ACTIVE', 'SUSPENDED'            | Lifecycle state                     |
| `created_at`  | `TIMESTAMPTZ`  | DEFAULT `now()`                  | Audit timestamp                     |

## 2. Human Resources (HR)

### `employees`

| Column          | Type            | Constraints                 | Description                     |
| :-------------- | :-------------- | :-------------------------- | :------------------------------ |
| `id`            | `UUID`          | PK                          | Primary Key                     |
| `tenant_id`     | `UUID`          | FK (tenants.id), INDEX      | Tenant ownership                |
| `employee_code` | `VARCHAR(20)`   | UNIQUE per tenant           | Employee ID (e.g., EMP-001)     |
| `first_name`    | `VARCHAR(100)`  | NOT NULL                    |                                 |
| `last_name`     | `VARCHAR(100)`  | NOT NULL                    |                                 |
| `email`         | `VARCHAR(255)`  | UNIQUE, NOT NULL            | Work email                      |
| `salary`        | `DECIMAL(15,2)` | DEFAULT 0.00                | Base salary (standard currency) |
| `department_id` | `UUID`          | FK (departments.id)         | Current department              |
| `manager_id`    | `UUID`          | FK (employees.id), NULLABLE | Reporting manager               |
| `status`        | `ENUM`          | 'ACTIVE', 'INACTIVE'        | Employment status               |

## 3. Finance & Accounting

### `chart_of_accounts`

| Column      | Type           | Constraints                                          | Description                |
| :---------- | :------------- | :--------------------------------------------------- | :------------------------- |
| `id`        | `UUID`         | PK                                                   |                            |
| `tenant_id` | `UUID`         | FK (tenants.id)                                      |                            |
| `code`      | `VARCHAR(20)`  | UNIQUE per tenant                                    | GL Code (e.g., 1000, 2010) |
| `name`      | `VARCHAR(255)` | NOT NULL                                             | Account name               |
| `parent_id` | `UUID`         | FK (chart_of_accounts.id)                            | Hierarchy (Adjacency list) |
| `type`      | `ENUM`         | 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE' |                            |

### `journal_entries`

| Column        | Type          | Constraints             | Description              |
| :------------ | :------------ | :---------------------- | :----------------------- |
| `id`          | `UUID`        | PK                      |                          |
| `reference`   | `VARCHAR(50)` | UNIQUE                  | Vouchers, Invoices, etc. |
| `posted_at`   | `TIMESTAMPTZ` | NOT NULL                | Accounting date          |
| `is_balanced` | `BOOLEAN`     | CHECK (Sum Dr = Sum Cr) | Integrity check          |

## 4. Inventory

### `products`

| Column             | Type            | Constraints            | Description           |
| :----------------- | :-------------- | :--------------------- | :-------------------- |
| `id`               | `UUID`          | PK                     |                       |
| `sku`              | `VARCHAR(100)`  | UNIQUE per tenant      | Stock Keeping Unit    |
| `cost_price`       | `DECIMAL(15,2)` | NOT NULL               | Valuation base        |
| `selling_price`    | `DECIMAL(15,2)` | NOT NULL               | Default list price    |
| `valuation_method` | `ENUM`          | 'FIFO', 'LIFO', 'AVCO' | Default for this item |

---

_Full Schema includes 50+ tables. Use TypeORM migrations for precise synchronization._
