import { PageHeader } from '../components/common/PageHeader';

export function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Sales, stock valuation, ageing, VAT, P&L, cash flow, and audit exports" />
      <div className="bg-white rounded-xl p-4 shadow-md text-sm text-slate-700">
        CSV/PDF export and scheduled email delivery controls.
      </div>
    </div>
  );
}
