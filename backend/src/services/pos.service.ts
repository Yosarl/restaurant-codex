import { Types } from 'mongoose';
import ProductModel from '../models/Product';
import OrderModel from '../models/Order';
import { consumeStock, receiveStock } from './inventory.service';
import { postSaleAccounting } from './accounting.service';
import { io } from '../config/socket';

function genOrderNo(): string {
  return `ORD-${Date.now()}`;
}

export async function createOrder(params: {
  outletId: string;
  tableId?: string;
  orderType: 'dine-in' | 'take-away' | 'delivery';
  orderLines: Array<{
    productId: string;
    qty: number;
    mods?: Array<{ name: string; priceDelta: number }>;
    note?: string;
    unitPrice?: number;
  }>;
  discountItem?: number;
  discountBill?: number;
  tips?: number;
  createdBy: string;
  status?: 'held' | 'open';
}): Promise<{ orderId: string; orderNo: string }> {
  const lines = [] as Array<{
    productId: Types.ObjectId;
    productName: string;
    qty: number;
    unitPrice: number;
    mods: Array<{ name: string; priceDelta: number }>;
    note?: string;
    lineTotal: number;
  }>;

  let subtotal = 0;
  let tax = 0;

  for (const line of params.orderLines) {
    const product = await ProductModel.findById(line.productId).lean();
    if (!product) throw new Error(`Product ${line.productId} not found`);

    const mods = line.mods || [];
    const modTotal = mods.reduce((sum, m) => sum + m.priceDelta, 0);
    const unitPrice = line.unitPrice ?? product.sellPrice;
    const lineTotal = (unitPrice + modTotal) * line.qty;

    subtotal += lineTotal;
    tax += lineTotal * product.taxRate;

    lines.push({
      productId: new Types.ObjectId(line.productId),
      productName: product.name,
      qty: line.qty,
      unitPrice,
      mods,
      note: line.note,
      lineTotal
    });
  }

  const itemDiscount = params.discountItem || 0;
  const billDiscount = params.discountBill || 0;
  const tips = params.tips || 0;
  const total = subtotal + tax + tips - itemDiscount - billDiscount;

  const order = await OrderModel.create({
    outletId: params.outletId,
    tableId: params.tableId,
    orderNo: genOrderNo(),
    orderType: params.orderType,
    orderLines: lines,
    status: params.status || 'open',
    subtotal,
    total,
    tax,
    discounts: {
      itemDiscount,
      billDiscount
    },
    tips,
    payments: [],
    createdBy: params.createdBy,
    heldAt: params.status === 'held' ? new Date() : undefined
  });

  io?.to(`outlet:${params.outletId}`).emit('order:created', order);
  io?.to(`outlet:${params.outletId}`).emit('kot:print', {
    orderId: order._id,
    orderNo: order.orderNo,
    tableId: order.tableId,
    lines: order.orderLines.map((l) => ({ name: l.productName, qty: l.qty, note: l.note }))
  });

  return { orderId: order._id.toString(), orderNo: order.orderNo };
}

export async function holdOrder(orderId: string): Promise<void> {
  const order = await OrderModel.findByIdAndUpdate(orderId, { status: 'held', heldAt: new Date() }, { new: true });
  if (!order) throw new Error('Order not found');
  io?.to(`outlet:${order.outletId}`).emit('order:updated', order);
}

export async function recallOrder(orderId: string): Promise<void> {
  const order = await OrderModel.findByIdAndUpdate(orderId, { status: 'open' }, { new: true });
  if (!order) throw new Error('Order not found');
  io?.to(`outlet:${order.outletId}`).emit('order:updated', order);
}

export async function settleOrder(params: {
  orderId: string;
  payments: Array<{ method: string; amount: number; ref?: string }>;
  userId: string;
  valuationMethod?: 'FIFO' | 'LIFO';
}): Promise<{ orderId: string; cogsAmount: number }> {
  const order = await OrderModel.findById(params.orderId).lean();
  if (!order) throw new Error('Order not found');
  if (order.status === 'settled') throw new Error('Order already settled');

  const paymentTotal = params.payments.reduce((sum, p) => sum + p.amount, 0);
  if (paymentTotal + 0.0001 < order.total) {
    throw new Error('Insufficient payment amount');
  }

  let cogsAmount = 0;

  for (const line of order.orderLines) {
    const product = await ProductModel.findById(line.productId).lean();
    if (!product) throw new Error(`Missing product ${line.productId}`);

    if (product.isRecipe) {
      for (const ingredient of product.recipe) {
        const requiredQty = ingredient.qty * line.qty;
        const result = await consumeStock({
          outletId: order.outletId.toString(),
          productId: ingredient.ingredientId.toString(),
          qty: requiredQty,
          referenceId: order._id.toString(),
          type: 'sale',
          note: `Recipe issue for ${product.name}`,
          userId: params.userId,
          valuationMethod: params.valuationMethod
        });
        cogsAmount += result.totalCost;
      }
    } else {
      const result = await consumeStock({
        outletId: order.outletId.toString(),
        productId: line.productId.toString(),
        qty: line.qty,
        referenceId: order._id.toString(),
        type: 'sale',
        note: `Direct sale issue`,
        userId: params.userId,
        valuationMethod: params.valuationMethod
      });
      cogsAmount += result.totalCost;
    }

    for (const mod of line.mods) {
      const modifierSource = (product.modifierGroups || []).flatMap((g) => g.options).find((m) => m.name === mod.name);
      if (modifierSource?.inventoryProductId && modifierSource.qty && modifierSource.qty > 0) {
        const result = await consumeStock({
          outletId: order.outletId.toString(),
          productId: modifierSource.inventoryProductId.toString(),
          qty: modifierSource.qty * line.qty,
          referenceId: order._id.toString(),
          type: 'sale',
          note: `Modifier issue ${mod.name}`,
          userId: params.userId,
          valuationMethod: params.valuationMethod
        });
        cogsAmount += result.totalCost;
      }
    }
  }

  await OrderModel.findByIdAndUpdate(order._id, {
    status: 'settled',
    settledBy: params.userId,
    settledAt: new Date(),
    payments: params.payments.map((p) => ({ ...p, paidAt: new Date() }))
  });

  await postSaleAccounting({
    outletId: order.outletId.toString(),
    orderId: order._id.toString(),
    total: order.total,
    tax: order.tax,
    cogsAmount,
    createdBy: params.userId
  });

  io?.to(`outlet:${order.outletId.toString()}`).emit('order:updated', {
    orderId: order._id,
    status: 'settled'
  });

  return { orderId: order._id.toString(), cogsAmount };
}

export async function returnOrder(params: {
  orderId: string;
  reason: string;
  userId: string;
}): Promise<void> {
  const order = await OrderModel.findById(params.orderId).lean();
  if (!order) throw new Error('Order not found');

  for (const line of order.orderLines) {
    const product = await ProductModel.findById(line.productId).lean();
    if (!product || product.isRecipe) continue;

    await receiveStock({
      outletId: order.outletId.toString(),
      lines: [
        {
          productId: line.productId.toString(),
          qty: line.qty,
          costPrice: product.costPrice,
          batchNo: `SRET-${Date.now()}`
        }
      ],
      type: 'return',
      referenceId: order._id.toString(),
      note: params.reason,
      userId: params.userId
    });
  }

  await OrderModel.findByIdAndUpdate(order._id, { status: 'returned' });

  io?.to(`outlet:${order.outletId.toString()}`).emit('order:updated', {
    orderId: order._id,
    status: 'returned'
  });
}

export async function shiftReport(shiftId: string): Promise<{
  shiftId: string;
  totalSales: number;
  orderCount: number;
  paymentBreakdown: Record<string, number>;
}> {
  const orders = await OrderModel.find({ shiftId, status: 'settled' }).lean();
  const paymentBreakdown: Record<string, number> = {};
  let totalSales = 0;

  for (const order of orders) {
    totalSales += order.total;
    for (const payment of order.payments) {
      paymentBreakdown[payment.method] = (paymentBreakdown[payment.method] || 0) + payment.amount;
    }
  }

  return {
    shiftId,
    totalSales,
    orderCount: orders.length,
    paymentBreakdown
  };
}
