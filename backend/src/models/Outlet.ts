import { Schema, model } from 'mongoose';

export interface Outlet {
  name: string;
  address: string;
  timezone: string;
  printers: Array<{
    name: string;
    type: 'escpos' | 'pdf' | 'webusb';
    target: string;
    isKitchen: boolean;
  }>;
}

const outletSchema = new Schema<Outlet>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    timezone: { type: String, default: 'UTC' },
    printers: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ['escpos', 'pdf', 'webusb'], required: true },
        target: { type: String, required: true },
        isKitchen: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

outletSchema.index({ name: 1 }, { unique: true });

export default model<Outlet>('Outlet', outletSchema);
