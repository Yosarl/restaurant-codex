import { useMemo } from 'react';
import type { PosLine } from '../../store/pos-store';

export function OrderPanel({
  lines,
  onQty,
  onRemove,
  onHold,
  onSettle,
  onRecall
}: {
  lines: PosLine[];
  onQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onHold: () => void;
  onSettle: () => void;
  onRecall: () => void;
}) {
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * (l.unitPrice + l.mods.reduce((s, m) => s + m.priceDelta, 0)), 0),
    [lines]
  );

  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  return (
    <aside className="bg-white rounded-xl p-3 shadow-md h-[72vh] flex flex-col">
      <h3 className="font-semibold mb-2">Current Order</h3>
      <div className="overflow-auto flex-1">
        {lines.map((l) => (
          <div key={l.productId} className="border-b py-2">
            <p className="text-sm font-medium">{l.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <input
                className="w-16 border rounded px-2 py-1"
                type="number"
                min={1}
                value={l.qty}
                onChange={(e) => onQty(l.productId, Number(e.target.value))}
              />
              <button className="text-xs text-rose-700" onClick={() => onRemove(l.productId)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t text-sm space-y-1">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: ${tax.toFixed(2)}</p>
        <p className="font-semibold">Total: ${total.toFixed(2)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button className="rounded bg-slate-100 py-2 text-sm" onClick={onRecall}>
          Recall (F3)
        </button>
        <button className="rounded bg-amber-500 text-white py-2 text-sm" onClick={onHold}>
          Hold (F2)
        </button>
        <button className="col-span-2 rounded bg-brand-700 text-white py-2 text-sm" onClick={onSettle}>
          Settle (Enter)
        </button>
      </div>
    </aside>
  );
}
