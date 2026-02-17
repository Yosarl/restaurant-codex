import { PageHeader } from '../components/common/PageHeader';

const tables = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, seats: i % 2 === 0 ? 4 : 2, status: i % 3 ? 'open' : 'occupied' }));

export function TablesPage() {
  return (
    <div>
      <PageHeader title="Tables & Floor Plan" subtitle="Drag/drop table layout, merge and split actions" />
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {tables.map((t) => (
          <article
            key={t.id}
            className={`rounded-xl p-3 border-2 ${t.status === 'occupied' ? 'border-rose-400 bg-rose-50' : 'border-emerald-400 bg-emerald-50'}`}
          >
            <p className="font-semibold">Table {t.id}</p>
            <p className="text-sm text-slate-600">Seats: {t.seats}</p>
            <div className="mt-2 flex gap-1">
              <button className="text-xs rounded border px-2 py-1">Split</button>
              <button className="text-xs rounded border px-2 py-1">Merge</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
