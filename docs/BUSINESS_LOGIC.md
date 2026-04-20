# Nurox ERP — Business Logic Specifications

> **Scope:** Definitions for calculated fields and state transitions.

## 1. Finance: The Double-Entry Engine

### Atomic Journal Posting

Every financial transaction (Invoice, Payment, Payroll) must use the `JournalService`.

- **Rule:** `sum(line_items.debit) - sum(line_items.credit) === 0`
- **Rule:** Transaction must be within an `accounting_period` where `status === 'OPEN'`.

### Accounts Receivable (AR) Workflow

1.  **Invoice Created:** `Dr Accounts Receivable`, `Cr Revenue`.
2.  **Payment Received:** `Dr Cash/Bank`, `Cr Accounts Receivable`.

## 2. Payroll: Gross-to-Net Computation

### Standard Formula

`Net Pay = (Base + HRA + Transport + Bonus) - (Tax + PF_Employee + Unpaid_Leave_Deduction)`

### Tax Logic (Dynamic Brackets)

Tax is calculated on `Taxable Income = Gross - (PF_Employee + Exemptions)`.

- Brackets are retrieved from `fiscal_year_config` based on the `tenantId`.
- Supports progressive scaling (e.g., 0% for first $X, 5% for next $Y).

### PF (Provident Fund)

- `Employee_PF = Base * 0.10`
- `Employer_PF = Base * 0.10` (Posted as Expense to the tenant)

## 3. Inventory: Valuation Logic

### FIFO (First-In, First-Out)

- **Data Structure:** `stock_movements` linked to specific `purchase_order_line_items`.
- **Calculation:** When selling 10 units, the system finds the oldest unconsumed "Inward" records and consumes their cost base first.

### Reorder Alert Trigger

`If (Current_Qty + Pending_PO_Qty) <= Reorder_Point THEN Create Alert`

- Checked via daily cron job in `inventory.processor.ts`.

## 4. HR: Leave Accrual

### Monthly Accrual Rule

`Accrued_Days = (Annual_Entitlement / 12) * Months_Worked_In_Fiscal_Year`

- Prorated based on the `joinDate`.
- Carry-forward logic applied at `Fiscal_Year_End` up to `Max_Carry_Forward` days defined in `leave_types`.

---

_Logic is implemented in `*.service.ts` and validated via `*.spec.ts` unit tests._
