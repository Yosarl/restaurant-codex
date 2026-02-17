import { PageHeader } from '../components/common/PageHeader';

export function ActivityPage() {
  return (
    <div>
      <PageHeader title="Activity & Audit" subtitle="Who/when/what changes for inventory and accounting actions" />
      <div className="bg-white rounded-xl p-4 shadow-md text-sm text-slate-700">Immutable audit log stream with filter by user/model/date.</div>
    </div>
  );
}
