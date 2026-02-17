import { Schema, model, Types } from 'mongoose';

export interface CashRegisterShift {
  outletId: Types.ObjectId;
  userId: Types.ObjectId;
  openTime: Date;
  closeTime?: Date;
  openingBalance: number;
  closingBalance?: number;
  status: 'open' | 'closed';
  transactions: Array<{ type: string; amount: number; refId?: string; at: Date }>;
}

const cashRegisterShiftSchema = new Schema<CashRegisterShift>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    openTime: { type: Date, required: true, index: true },
    closeTime: Date,
    openingBalance: { type: Number, required: true },
    closingBalance: Number,
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    transactions: [
      {
        type: { type: String, required: true },
        amount: { type: Number, required: true },
        refId: String,
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

cashRegisterShiftSchema.index({ outletId: 1, status: 1, openTime: -1 });

export default model<CashRegisterShift>('CashRegisterShift', cashRegisterShiftSchema);
