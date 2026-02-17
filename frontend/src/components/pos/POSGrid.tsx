import { useMemo } from 'react';

export interface PosProduct {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  sellPrice: number;
  images?: string[];
  categoryName?: string;
}

export function POSGrid({
  products,
  search,
  onSelect
}: {
  products: PosProduct[];
  search: string;
  onSelect: (p: PosProduct) => void;
}) {
  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        (p.barcode || '').toLowerCase().includes(s)
    );
  }, [products, search]);

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[72vh] overflow-auto pr-1">
      {visible.map((p) => (
        <button
          key={p._id}
          type="button"
          onClick={() => onSelect(p)}
          className="rounded-xl bg-white shadow-tile p-2 text-left hover:scale-[1.01] transition-transform"
          aria-label={`Add ${p.name}`}
        >
          <div className="h-24 bg-slate-100 rounded-md mb-2 overflow-hidden">
            {p.images?.[0] ? (
              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-xs text-slate-500">No Image</div>
            )}
          </div>
          <p className="text-sm font-semibold line-clamp-2">{p.name}</p>
          <p className="text-xs text-slate-500">{p.sku}</p>
          <p className="text-sm mt-1 text-brand-700 font-semibold">${p.sellPrice.toFixed(2)}</p>
        </button>
      ))}
    </section>
  );
}
