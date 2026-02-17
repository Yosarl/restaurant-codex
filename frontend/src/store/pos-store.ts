import { create } from 'zustand';

export interface PosLine {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  mods: Array<{ name: string; priceDelta: number }>;
}

interface PosState {
  outletId: string;
  category: string;
  search: string;
  lines: PosLine[];
  heldOrders: Array<{ id: string; name: string; lines: PosLine[] }>;
  setOutlet: (id: string) => void;
  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  addLine: (line: Omit<PosLine, 'qty'>) => void;
  updateQty: (productId: string, qty: number) => void;
  removeLine: (productId: string) => void;
  holdCurrent: () => void;
  recall: (id: string) => void;
  clear: () => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  outletId: '',
  category: 'All',
  search: '',
  lines: [],
  heldOrders: [],
  setOutlet: (id) => set({ outletId: id }),
  setCategory: (category) => set({ category }),
  setSearch: (search) => set({ search }),
  addLine: (line) => {
    const existing = get().lines.find((l) => l.productId === line.productId);
    if (existing) {
      set({
        lines: get().lines.map((l) =>
          l.productId === line.productId
            ? { ...l, qty: l.qty + 1 }
            : l
        )
      });
      return;
    }
    set({ lines: [...get().lines, { ...line, qty: 1 }] });
  },
  updateQty: (productId, qty) => set({ lines: get().lines.map((l) => (l.productId === productId ? { ...l, qty } : l)) }),
  removeLine: (productId) => set({ lines: get().lines.filter((l) => l.productId !== productId) }),
  holdCurrent: () => {
    const id = `held-${Date.now()}`;
    set({ heldOrders: [...get().heldOrders, { id, name: id, lines: get().lines }], lines: [] });
  },
  recall: (id) => {
    const held = get().heldOrders.find((h) => h.id === id);
    if (!held) return;
    set({
      lines: held.lines,
      heldOrders: get().heldOrders.filter((h) => h.id !== id)
    });
  },
  clear: () => set({ lines: [] })
}));
