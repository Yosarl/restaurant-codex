# Accounting Rules and Month-End Workflow

## Auto Journal Rules
- Sales settlement:
  - Dr Cash/Bank
  - Cr Sales Revenue
  - Cr VAT Payable
  - Dr COGS
  - Cr Inventory
- Purchase invoice:
  - Dr Inventory
  - Dr VAT Input
  - Cr Accounts Payable
- Purchase payment:
  - Dr Accounts Payable
  - Cr Cash/Bank
- Stock adjustment increase:
  - Dr Inventory
  - Cr Stock Adjustment Expense
- Stock adjustment decrease:
  - Dr Stock Adjustment Expense
  - Cr Inventory

## Product-to-COA Mapping
- Product schema supports:
  - `inventoryAccountId`
  - `revenueAccountId`
  - `cogsAccountId`
  - `taxAccountId`
- Service falls back to outlet default accounts when mapping is not provided.

## Month-end Close Workflow
1. Freeze prior period order/purchase posting.
2. Reconcile cash and bank accounts.
3. Review stock adjustments and variance.
4. Run inventory valuation and ageing reports.
5. Post required accrual/adjustment journals.
6. Run P&L, balance check (trial balance), and VAT report.
7. Mark period closed in accounting settings.
