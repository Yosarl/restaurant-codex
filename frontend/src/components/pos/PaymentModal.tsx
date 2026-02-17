import { useState } from 'react';

export function PaymentModal({
  total,
  onClose,
  onConfirm
}: {
  total: number;
  onClose: () => void;
  onConfirm: (payments: Array<{ method: string; amount: number }>) => void;
}) {
  const [amount, setAmount] = useState(total);
  const [method, setMethod] = useState('cash');

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div className="bg-white rounded-xl p-4 w-full max-w-sm">
        <h3 className="font-semibold text-lg">Settle Payment</h3>
        <p className="text-sm text-slate-600">Total due ${total.toFixed(2)}</p>
        <label className="block mt-3 text-sm">Method</label>
        <select className="w-full border rounded px-3 py-2" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="wallet">Wallet</option>
        </select>
        <label className="block mt-3 text-sm">Amount</label>
        <input
          className="w-full border rounded px-3 py-2"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="rounded border py-2" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded bg-brand-700 text-white py-2"
            onClick={() => onConfirm([{ method, amount }])}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
