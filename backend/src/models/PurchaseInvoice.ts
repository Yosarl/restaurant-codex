import { Schema, model, Types } from 'mongoose';

export interface PurchaseInvoice {
  outletId: Types.ObjectId;
  supplierId: Types.ObjectId;
  poId?: Types.ObjectId;
  invoiceNo: string;
  status: 'unpaid' | 'partially_paid' | 'paid';
  lines: Array<{
    productId: Types.ObjectId;
    qty: number;
    unitCost: number;
    taxRate: number;
    batchNo: string;
    expiryDate?: Date;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueDate?: Date;
  creditNoteAmount: number;
  createdBy: Types.ObjectId;
}

const purchaseInvoiceSchema = new Schema<PurchaseInvoice>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    invoiceNo: { type: String, required: true },
    status: { type: String, enum: ['unpaid', 'partially_paid', 'paid'], default: 'unpaid', index: true },
    lines: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true },
        unitCost: { type: Number, required: true },
        taxRate: { type: Number, default: 0 },
        batchNo: { type: String, required: true },
        expiryDate: Date
      }
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: Date,
    creditNoteAmount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

purchaseInvoiceSchema.index({ outletId: 1, invoiceNo: 1 }, { unique: true });

export default model<PurchaseInvoice>('PurchaseInvoice', purchaseInvoiceSchema);
