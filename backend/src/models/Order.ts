import { Schema, model, Types } from 'mongoose';

export interface Order {
  outletId: Types.ObjectId;
  tableId?: string;
  orderNo: string;
  orderType: 'dine-in' | 'take-away' | 'delivery';
  customerId?: Types.ObjectId;
  orderLines: Array<{
    productId: Types.ObjectId;
    productName: string;
    qty: number;
    unitPrice: number;
    mods: Array<{ name: string; priceDelta: number }>;
    note?: string;
    lineTotal: number;
  }>;
  status: 'held' | 'open' | 'ready' | 'served' | 'settled' | 'returned' | 'cancelled';
  subtotal: number;
  total: number;
  tax: number;
  discounts: {
    itemDiscount: number;
    billDiscount: number;
  };
  tips: number;
  payments: Array<{ method: string; amount: number; ref?: string; paidAt: Date }>;
  createdBy: Types.ObjectId;
  settledBy?: Types.ObjectId;
  heldAt?: Date;
  settledAt?: Date;
  shiftId?: Types.ObjectId;
}

const orderSchema = new Schema<Order>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    tableId: String,
    orderNo: { type: String, required: true },
    orderType: { type: String, enum: ['dine-in', 'take-away', 'delivery'], default: 'dine-in', index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    orderLines: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        qty: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        mods: [
          {
            name: { type: String, required: true },
            priceDelta: { type: Number, default: 0 }
          }
        ],
        note: String,
        lineTotal: { type: Number, required: true }
      }
    ],
    status: {
      type: String,
      enum: ['held', 'open', 'ready', 'served', 'settled', 'returned', 'cancelled'],
      default: 'open',
      index: true
    },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    tax: { type: Number, required: true },
    discounts: {
      itemDiscount: { type: Number, default: 0 },
      billDiscount: { type: Number, default: 0 }
    },
    tips: { type: Number, default: 0 },
    payments: [
      {
        method: { type: String, required: true },
        amount: { type: Number, required: true },
        ref: String,
        paidAt: { type: Date, default: Date.now }
      }
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    settledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    heldAt: Date,
    settledAt: Date,
    shiftId: { type: Schema.Types.ObjectId, ref: 'CashRegisterShift' }
  },
  { timestamps: true }
);

orderSchema.index({ outletId: 1, orderNo: 1 }, { unique: true });
orderSchema.index({ outletId: 1, status: 1, createdAt: -1 });

export default model<Order>('Order', orderSchema);
