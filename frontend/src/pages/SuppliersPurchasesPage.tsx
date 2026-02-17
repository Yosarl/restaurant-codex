import { PageHeader } from '../components/common/PageHeader';

export function SuppliersPurchasesPage() {
  return (
    <div>
      <PageHeader title="Suppliers & Purchases" subtitle="PO -> GRN -> Invoice -> Return flow with supplier ledger" />
      <div className="bg-white rounded-xl p-4 shadow-md text-sm text-slate-700">
        Purchase pipeline and supplier performance metrics.
      </div>
    </div>
  );
}
