import { Schema, model, Types } from 'mongoose';

export type StockMovementType = 'receive' | 'issue' | 'adjust' | 'transfer' | 'sale' | 'return';

export interface StockMovement {
  productId: Types.ObjectId;
  outletId: Types.ObjectId;
  type: StockMovementType;
  qty: number;
  valuationCost: number;
  referenceId?: string;
  userId?: Types.ObjectId;
  note?: string;
  createdAt: Date;
}

const stockMovementSchema = new Schema<StockMovement>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    type: {
      type: String,
      enum: ['receive', 'issue', 'adjust', 'transfer', 'sale', 'return'],
      required: true,
      index: true
    },
    qty: { type: Number, required: true },
    valuationCost: { type: Number, default: 0 },
    referenceId: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    note: String
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

stockMovementSchema.index({ outletId: 1, productId: 1, createdAt: -1 });

export default model<StockMovement>('StockMovement', stockMovementSchema);
