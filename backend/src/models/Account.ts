import { Schema, model, Types } from 'mongoose';

export interface Account {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: Types.ObjectId;
  outletId?: Types.ObjectId;
  isSystem: boolean;
  isActive: boolean;
}

const accountSchema = new Schema<Account>(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['asset', 'liability', 'equity', 'revenue', 'expense'], required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Account' },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

accountSchema.index({ code: 1, outletId: 1 }, { unique: true });

export default model<Account>('Account', accountSchema);
