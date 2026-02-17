import { PageHeader } from '../components/common/PageHeader';

export function InventoryPage() {
  return (
    <div>
      <PageHeader title="Inventory" subtitle="Opening stock, batches, transfers, stock take, and adjustments" />
      <div className="bg-white rounded-xl p-4 shadow-md text-sm text-slate-700">
        FIFO/LIFO valuation toggle, low stock and expiry alerts.
      </div>
    </div>
  );
}
