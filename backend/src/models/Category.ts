import { Schema, model } from 'mongoose';

export interface Category {
  name: string;
  parentId?: Schema.Types.ObjectId;
  outletId?: Schema.Types.ObjectId;
}

const categorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true }
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, outletId: 1 }, { unique: true });

export default model<Category>('Category', categorySchema);
