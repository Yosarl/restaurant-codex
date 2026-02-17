import { PageHeader } from '../components/common/PageHeader';

const cards = [
  { name: 'Daily Sales', value: '$7,820' },
  { name: 'Low Stock Alerts', value: '12 items' },
  { name: 'Top Item', value: 'Chicken Burger' },
  { name: 'Open Tables', value: '18 / 40' }
];

export function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Daily KPIs across all outlets" />
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <article key={c.name} className="bg-white rounded-xl p-4 shadow-md">
            <p className="text-xs uppercase text-slate-500">{c.name}</p>
            <p className="text-2xl font-semibold mt-2">{c.value}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
