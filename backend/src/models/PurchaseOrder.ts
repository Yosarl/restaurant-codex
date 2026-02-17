import { Schema, model, Types } from 'mongoose';

export interface PurchaseOrder {
  outletId: Types.ObjectId;
  supplierId: Types.ObjectId;
  orderNo: string;
  status: 'draft' | 'approved' | 'received' | 'closed' | 'cancelled';
  expectedDate?: Date;
  lines: Array<{ productId: Types.ObjectId; qty: number; unitCost: number }>;
  notes?: string;
  createdBy: Types.ObjectId;
}

const purchaseOrderSchema = new Schema<PurchaseOrder>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    orderNo: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'approved', 'received', 'closed', 'cancelled'],
      default: 'draft',
      index: true
    },
    expectedDate: Date,
    lines: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true, min: 0 },
        unitCost: { type: Number, required: true, min: 0 }
      }
    ],
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ outletId: 1, orderNo: 1 }, { unique: true });

export default model<PurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
