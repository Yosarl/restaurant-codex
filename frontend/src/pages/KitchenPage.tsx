import { PageHeader } from '../components/common/PageHeader';

export function KitchenPage() {
  return (
    <div>
      <PageHeader title="Kitchen KOT" subtitle="Real-time tickets via socket events, with print queue controls" />
      <div className="bg-white rounded-xl p-4 shadow-md space-y-2">
        <p className="text-sm">Filters: outlet, station, delayed tickets.</p>
        <button className="rounded bg-brand-700 text-white px-3 py-2 text-sm">Reprint Selected KOT</button>
      </div>
    </div>
  );
}
