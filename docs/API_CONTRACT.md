# Nurox ERP — API Contract

> **Base URL:** `/api/v1`
> **Format:** JSON
> **Auth:** Bearer Token (JWT RS256)
> **Tenant Isolation:** Header `x-tenant-id` mandatory for all private routes.

## 1. Authentication

| Method | Path               | Description   | Payload               |
| :----- | :----------------- | :------------ | :-------------------- |
| `POST` | `/auth/login`      | Session start | `{ email, password }` |
| `POST` | `/auth/refresh`    | Rotate tokens | `{ refreshToken }`    |
| `POST` | `/auth/mfa/verify` | 2FA Check     | `{ code, ticket }`    |

## 2. Human Resources (HR)

| Method  | Path                | Description          | Response                     |
| :------ | :------------------ | :------------------- | :--------------------------- |
| `GET`   | `/hr/employees`     | List with Pagination | `{ data: Employee[], meta }` |
| `POST`  | `/hr/employees`     | Create New Hire      | `{ id, employeeCode, ... }`  |
| `PATCH` | `/hr/employees/:id` | Update profile       | `{ ...updatedFields }`       |
| `GET`   | `/hr/org-chart`     | Recursive tree       | `{ name, children: [] }`     |

## 3. Finance

| Method | Path                | Description    | Constraints           |
| :----- | :------------------ | :------------- | :-------------------- |
| `POST` | `/finance/journals` | Post Entry     | Dr must equal Cr      |
| `GET`  | `/finance/gl/:id`   | Ledger history | Filter by Date Range  |
| `POST` | `/finance/invoices` | Create Invoice | Auto-posts to GL (AR) |

## 4. Inventory

| Method | Path                  | Description     | Constraints          |
| :----- | :-------------------- | :-------------- | :------------------- |
| `GET`  | `/inventory/stock`    | Current balance | Per Warehouse        |
| `POST` | `/inventory/transfer` | Move stock      | Source must have Qty |

## Response Envelopes

### Success (200 OK / 201 Created)

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 125 }
}
```

### Error (4xx / 5xx)

```json
{
  "success": false,
  "error": {
    "code": "VAL_001",
    "message": "Validation failed",
    "details": [{ "path": "email", "message": "Invalid format" }]
  }
}
```

---

_Swagger UI available at `/api/docs` during development._
