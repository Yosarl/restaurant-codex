import { PageHeader } from '../components/common/PageHeader';

export function OrdersPage() {
  return (
    <div>
      <PageHeader title="Orders" subtitle="Active, held, ready, and served statuses" />
      <div className="bg-white rounded-xl p-4 shadow-md">
        <p className="text-sm text-slate-600">Order timeline and status board with filters by outlet, cashier, and type.</p>
      </div>
    </div>
  );
}
