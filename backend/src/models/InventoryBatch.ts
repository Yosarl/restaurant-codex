import { Schema, model, Types } from 'mongoose';

export interface InventoryBatch {
  productId: Types.ObjectId;
  outletId: Types.ObjectId;
  batchNo: string;
  qty: number;
  remainingQty: number;
  expiryDate?: Date;
  costPrice: number;
  createdAt: Date;
}

const inventoryBatchSchema = new Schema<InventoryBatch>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    batchNo: { type: String, required: true },
    qty: { type: Number, required: true },
    remainingQty: { type: Number, required: true },
    expiryDate: { type: Date, index: true },
    costPrice: { type: Number, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

inventoryBatchSchema.index({ outletId: 1, productId: 1, createdAt: 1 });
inventoryBatchSchema.index({ outletId: 1, productId: 1, expiryDate: 1 });

export default model<InventoryBatch>('InventoryBatch', inventoryBatchSchema);
