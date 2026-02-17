# UI Pages and Acceptance Criteria

## Pages
- `/login`: login + optional MFA input.
- `/dashboard`: KPIs (daily sales, low stock alerts, top items, open tables).
- `/pos`: tile-based POS, image tiles, search, hold/recall/settle, keyboard support.
- `/tables`: floor-table board with split/merge actions.
- `/orders`: active/held/ready/served order tracking.
- `/kitchen`: KOT filter panel + reprint trigger.
- `/products`: product CRUD/BOM/variants/modifiers placeholder panel.
- `/suppliers`: purchase pipeline and supplier summary.
- `/inventory`: opening stock, valuation, transfers, adjustments summary.
- `/accounting`: COA/journal/ledger/reconcile summary.
- `/reports`: sales/stock/P&L/VAT export controls.
- `/settings`: outlets/VAT/printer/payment/roles config summary.
- `/activity`: audit stream view.

## POS-specific UX
- Large image tile grid with configurable category chips.
- Keyboard:
  - `1..9` category mapping
  - `F1` recent/held bills panel
  - `F2` hold order
  - `F3` recall order
  - `Enter` settle modal
- Barcode/name/SKU quick search.
- Offline queue in IndexedDB with online sync callback.
- Inactivity auto-lock notice after 5 minutes.

## Acceptance Criteria
- POS grid should support 120 visible tiles with no layout shift.
- Search should use in-memory filtering and update near-instantly for typical catalog size.
- Mobile manager access: all management pages are responsive down to 360px width.
- Basic accessibility: focus-visible states and keyboard operability for primary actions.
