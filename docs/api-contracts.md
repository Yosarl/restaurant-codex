# API Contracts (Example Requests/Responses)

## Auth
### POST /api/auth/login
Request
```json
{ "email": "admin@restaurant.local", "password": "Admin@1234" }
```
Response
```json
{ "accessToken": "<jwt>", "refreshToken": "<refresh>" }
```
Validation: valid email + password min 8.

### POST /api/auth/refresh
Request
```json
{ "refreshToken": "<refresh>" }
```
Response
```json
{ "accessToken": "<jwt>", "refreshToken": "<refresh2>" }
```
Validation: token string required.

## Products
### GET /api/products?outlet=<id>&category=<id>&lowStock=true&search=burger&page=1&limit=20
Response
```json
{ "items": [{ "_id": "...", "name": "Chicken Burger" }], "meta": { "page": 1, "limit": 20, "total": 1 } }
```
Validation: pagination max limit 100.

### POST /api/products
```json
{
  "outletId": "65f...",
  "sku": "MENU-CH-BURGER",
  "name": "Chicken Burger",
  "categoryId": "65f...",
  "costPrice": 0,
  "sellPrice": 8.5,
  "taxRate": 0.12,
  "unit": "portion",
  "isRecipe": true,
  "recipe": [{ "ingredientId": "65f...", "qty": 0.18 }],
  "reorderLevel": 0
}
```
Validation: required numeric non-negative prices and valid object ids.

## Inventory
### POST /api/inventory/opening-stock
```json
{
  "outletId": "65f...",
  "lines": [{ "productId": "65f...", "qty": 20, "costPrice": 2.5, "batchNo": "OP-001" }]
}
```
Response
```json
{ "message": "Opening stock recorded" }
```
Validation: qty > 0, costPrice >= 0.

### POST /api/inventory/adjustment
```json
{ "outletId": "65f...", "productId": "65f...", "qty": -2, "reason": "damaged", "valuationMethod": "FIFO" }
```
Response
```json
{ "message": "Stock adjusted", "adjustmentCost": 5.1 }
```
Validation: qty != 0, reason min 3 chars.

## Purchase
### POST /api/purchase/invoices
```json
{
  "outletId": "65f...",
  "supplierId": "65f...",
  "createdBy": "65f...",
  "paidAmount": 0,
  "lines": [{ "productId": "65f...", "qty": 10, "unitCost": 2, "taxRate": 0.12, "batchNo": "POB-1" }]
}
```
Response
```json
{ "invoiceId": "65f...", "invoiceNo": "PI-173..." }
```
Validation: lines min 1, qty > 0.

## POS
### POST /api/pos/create-order
```json
{
  "outletId": "65f...",
  "orderType": "dine-in",
  "createdBy": "65f...",
  "orderLines": [{ "productId": "65f...", "qty": 2 }]
}
```
Response
```json
{ "orderId": "65f...", "orderNo": "ORD-173..." }
```

### POST /api/pos/settle
```json
{ "orderId": "65f...", "userId": "65f...", "payments": [{ "method": "cash", "amount": 30 }] }
```
Response
```json
{ "orderId": "65f...", "cogsAmount": 9.2 }
```
Validation: payment total >= order total.

## Accounting
### POST /api/accounting/journal
```json
{
  "outletId": "65f...",
  "referenceType": "manual",
  "description": "Month-end correction",
  "lines": [
    { "accountId": "65f...", "debit": 100, "credit": 0 },
    { "accountId": "65f...", "debit": 0, "credit": 100 }
  ]
}
```
Validation: debits must equal credits.

## Reports
### GET /api/reports/pnl?outletId=<id>&from=2026-01-01T00:00:00.000Z&to=2026-01-31T23:59:59.999Z
Response
```json
{ "revenue": 42000, "expenses": 31500, "netProfit": 10500 }
```

## Error Pattern
```json
{ "message": "Validation error", "errors": { "fieldErrors": { "email": ["Invalid email"] } } }
```

## Pagination Pattern
```json
{ "items": [], "meta": { "page": 1, "limit": 20, "total": 0 } }
```

## Socket Events
- `order:created`
- `order:updated`
- `kot:print`
- `stock:changed`
