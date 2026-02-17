import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db';
import { env } from '../config/env';
import RoleModel from '../models/Role';
import OutletModel from '../models/Outlet';
import UserModel from '../models/User';
import SupplierModel from '../models/Supplier';
import CategoryModel from '../models/Category';
import ProductModel from '../models/Product';
import InventoryBatchModel from '../models/InventoryBatch';
import PurchaseOrderModel from '../models/PurchaseOrder';
import AccountModel from '../models/Account';
import { createPurchaseInvoice, createPurchaseOrder } from '../services/purchase.service';
import { createOrder, settleOrder } from '../services/pos.service';
import { ensureDefaultAccounts } from '../services/accounting.service';

async function main(): Promise<void> {
  await connectDatabase();

  const raw = fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf-8');
  const seed = JSON.parse(raw) as any;

  await Promise.all([
    RoleModel.deleteMany({}),
    OutletModel.deleteMany({}),
    UserModel.deleteMany({}),
    SupplierModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    ProductModel.deleteMany({}),
    InventoryBatchModel.deleteMany({}),
    PurchaseOrderModel.deleteMany({}),
    AccountModel.deleteMany({})
  ]);

  const roleMap = new Map<string, string>();
  for (const role of seed.roles) {
    const doc = await RoleModel.create(role);
    roleMap.set(role.name, doc._id.toString());
  }

  const outletMap = new Map<string, string>();
  for (const outlet of seed.outlets) {
    const doc = await OutletModel.create(outlet);
    outletMap.set(outlet.name, doc._id.toString());
    await ensureDefaultAccounts(doc._id.toString());

    for (const account of seed.coa) {
      await AccountModel.updateOne(
        { outletId: doc._id, code: account.code },
        { $setOnInsert: { ...account, outletId: doc._id, isSystem: true, isActive: true } },
        { upsert: true }
      );
    }
  }

  const userMap = new Map<string, string>();
  for (const user of seed.users) {
    const passwordHash = await bcrypt.hash(user.password, env.BCRYPT_ROUNDS);
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      passwordHash,
      roleId: roleMap.get(user.role),
      outlets: user.outlets.map((n: string) => outletMap.get(n)),
      isActive: true
    });
    userMap.set(user.email, doc._id.toString());
  }

  const supplierMap = new Map<string, string>();
  const downtown = outletMap.get('Downtown Outlet')!;
  const ap = await AccountModel.findOne({ outletId: downtown, code: '2100' }).lean();
  for (const supplier of seed.suppliers) {
    const doc = await SupplierModel.create({ ...supplier, ledgerAccountId: ap?._id });
    supplierMap.set(supplier.name, doc._id.toString());
  }

  const categoryMap = new Map<string, string>();
  for (const category of seed.categories) {
    const doc = await CategoryModel.create({ name: category, outletId: downtown });
    categoryMap.set(category, doc._id.toString());
  }

  const productMap = new Map<string, string>();
  for (const p of seed.products) {
    const doc = await ProductModel.create({
      outletId: downtown,
      sku: p.sku,
      name: p.name,
      categoryId: categoryMap.get(p.category),
      costPrice: p.costPrice,
      sellPrice: p.sellPrice,
      taxRate: p.taxRate,
      unit: p.unit,
      images: [],
      isRecipe: p.isRecipe,
      recipe: [],
      variants: [],
      modifierGroups: [],
      reorderLevel: p.reorderLevel,
      batchTracking: false,
      expiryTracking: false
    });
    productMap.set(p.sku, doc._id.toString());
  }

  for (const p of seed.products.filter((x: any) => x.isRecipe && x.recipe?.length)) {
    const recipe = p.recipe.map((r: any) => ({ ingredientId: productMap.get(r.ingredientSku), qty: r.qty }));
    await ProductModel.updateOne({ sku: p.sku, outletId: downtown }, { $set: { recipe } });
  }

  for (const batch of seed.openingBatches) {
    await InventoryBatchModel.create({
      outletId: downtown,
      productId: productMap.get(batch.sku),
      batchNo: batch.batchNo,
      qty: batch.qty,
      remainingQty: batch.qty,
      costPrice: batch.costPrice
    });
  }

  for (const po of seed.purchaseOrders) {
    await createPurchaseOrder({
      outletId: downtown,
      supplierId: supplierMap.get(po.supplier)!,
      createdBy: userMap.get('admin@restaurant.local')!,
      lines: po.lines.map((l: any) => ({ productId: productMap.get(l.sku)!, qty: l.qty, unitCost: l.unitCost }))
    });
  }

  for (const po of seed.purchaseOrders) {
    await createPurchaseInvoice({
      outletId: downtown,
      supplierId: supplierMap.get(po.supplier)!,
      createdBy: userMap.get('admin@restaurant.local')!,
      paidAmount: 0,
      lines: po.lines.map((l: any, index: number) => ({
        productId: productMap.get(l.sku)!,
        qty: l.qty,
        unitCost: l.unitCost,
        taxRate: 0.12,
        batchNo: `PUR-${Date.now()}-${index}`
      }))
    });
  }

  for (const sale of seed.salesOrders) {
    const created = await createOrder({
      outletId: downtown,
      orderType: 'dine-in',
      createdBy: userMap.get('cashier@restaurant.local')!,
      orderLines: sale.lines.map((l: any) => ({ productId: productMap.get(l.sku)!, qty: l.qty }))
    });

    await settleOrder({
      orderId: created.orderId,
      userId: userMap.get('cashier@restaurant.local')!,
      payments: [{ method: 'cash', amount: 200 }]
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete');
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
