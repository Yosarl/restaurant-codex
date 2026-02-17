import { PageHeader } from '../components/common/PageHeader';

export function AccountingPage() {
  return (
    <div>
      <PageHeader title="Accounting" subtitle="COA, journals, ledgers, AP/AR, bank reconciliation, shift close" />
      <div className="bg-white rounded-xl p-4 shadow-md text-sm text-slate-700">
        Double-entry postings are auto-generated from POS and purchases.
      </div>
    </div>
  );
}
