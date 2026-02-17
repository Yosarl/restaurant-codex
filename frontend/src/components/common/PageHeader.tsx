export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-600 mt-1">{subtitle}</p> : null}
    </header>
  );
}
