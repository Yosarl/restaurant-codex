import { Schema, model, Types } from 'mongoose';

interface RecipeLine {
  ingredientId: Types.ObjectId;
  qty: number;
}

interface Variant {
  name: string;
  priceDelta: number;
  sku?: string;
}

export interface Product {
  outletId: Types.ObjectId;
  sku: string;
  name: string;
  description?: string;
  barcode?: string;
  categoryId: Types.ObjectId;
  costPrice: number;
  sellPrice: number;
  taxRate: number;
  unit: string;
  yieldPortions?: number;
  batchTracking: boolean;
  expiryTracking: boolean;
  images: string[];
  isRecipe: boolean;
  recipe: RecipeLine[];
  variants: Variant[];
  modifierGroups: Array<{
    name: string;
    required: boolean;
    options: Array<{ name: string; priceDelta: number; inventoryProductId?: Types.ObjectId; qty?: number }>;
  }>;
  reorderLevel: number;
  inventoryAccountId?: Types.ObjectId;
  revenueAccountId?: Types.ObjectId;
  cogsAccountId?: Types.ObjectId;
  taxAccountId?: Types.ObjectId;
  isActive: boolean;
}

const productSchema = new Schema<Product>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    sku: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: String,
    barcode: { type: String, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0 },
    unit: { type: String, required: true },
    yieldPortions: Number,
    batchTracking: { type: Boolean, default: false },
    expiryTracking: { type: Boolean, default: false },
    images: [{ type: String }],
    isRecipe: { type: Boolean, default: false },
    recipe: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true, min: 0 }
      }
    ],
    variants: [
      {
        name: { type: String, required: true },
        priceDelta: { type: Number, default: 0 },
        sku: String
      }
    ],
    modifierGroups: [
      {
        name: { type: String, required: true },
        required: { type: Boolean, default: false },
        options: [
          {
            name: { type: String, required: true },
            priceDelta: { type: Number, default: 0 },
            inventoryProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
            qty: { type: Number, default: 0 }
          }
        ]
      }
    ],
    reorderLevel: { type: Number, default: 0 },
    inventoryAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    revenueAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    cogsAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    taxAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ outletId: 1, sku: 1 }, { unique: true });
productSchema.index({ outletId: 1, name: 'text', barcode: 'text' });

export default model<Product>('Product', productSchema);
