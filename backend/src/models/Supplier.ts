import { Schema, model, Types } from 'mongoose';

export interface Supplier {
  name: string;
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  ledgerAccountId: Types.ObjectId;
  isActive: boolean;
}

const supplierSchema = new Schema<Supplier>(
  {
    name: { type: String, required: true, trim: true },
    contact: {
      email: String,
      phone: String,
      address: String
    },
    ledgerAccountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

supplierSchema.index({ name: 1 }, { unique: true });

export default model<Supplier>('Supplier', supplierSchema);
