import { Schema, model } from 'mongoose';

export interface Customer {
  name: string;
  phone?: string;
  type: 'walkin' | 'registered' | 'corporate';
  loyaltyPoints: number;
}

const customerSchema = new Schema<Customer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, index: true },
    type: { type: String, enum: ['walkin', 'registered', 'corporate'], default: 'walkin', index: true },
    loyaltyPoints: { type: Number, default: 0 }
  },
  { timestamps: true }
);

customerSchema.index({ phone: 1 }, { sparse: true, unique: true });

export default model<Customer>('Customer', customerSchema);
