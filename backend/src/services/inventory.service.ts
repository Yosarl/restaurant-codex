import InventoryBatchModel from '../models/InventoryBatch';
import StockMovementModel from '../models/StockMovement';
import { io } from '../config/socket';

export type ValuationMethod = 'FIFO' | 'LIFO';

export async function receiveStock(params: {
  outletId: string;
  lines: Array<{ productId: string; qty: number; costPrice: number; batchNo: string; expiryDate?: Date }>;
  referenceId?: string;
  type?: 'receive' | 'return';
  note?: string;
  userId?: string;
}): Promise<void> {
  for (const line of params.lines) {
    const batch = await InventoryBatchModel.create({
      productId: line.productId,
      outletId: params.outletId,
      batchNo: line.batchNo,
      qty: line.qty,
      remainingQty: line.qty,
      expiryDate: line.expiryDate,
      costPrice: line.costPrice
    });

    await StockMovementModel.create({
      productId: line.productId,
      outletId: params.outletId,
      type: params.type || 'receive',
      qty: line.qty,
      valuationCost: line.qty * line.costPrice,
      referenceId: params.referenceId,
      userId: params.userId,
      note: params.note || `Batch ${batch.batchNo} received`
    });

    io?.to(`outlet:${params.outletId}`).emit('stock:changed', {
      productId: line.productId,
      outletId: params.outletId,
      qtyDelta: line.qty
    });
  }
}

export async function consumeStock(params: {
  outletId: string;
  productId: string;
  qty: number;
  referenceId?: string;
  type?: 'issue' | 'sale' | 'transfer' | 'adjust' | 'return';
  note?: string;
  userId?: string;
  valuationMethod?: ValuationMethod;
}): Promise<{ totalCost: number; consumedBatches: Array<{ batchId: string; qty: number; unitCost: number }> }> {
  const valuationMethod = params.valuationMethod || 'FIFO';
  const sortOrder = valuationMethod === 'FIFO' ? 1 : -1;

  const batches = await InventoryBatchModel.find({
    outletId: params.outletId,
    productId: params.productId,
    remainingQty: { $gt: 0 }
  }).sort({ createdAt: sortOrder });

  let remainingToIssue = params.qty;
  let totalCost = 0;
  const consumedBatches: Array<{ batchId: string; qty: number; unitCost: number }> = [];

  for (const batch of batches) {
    if (remainingToIssue <= 0) break;

    const issueQty = Math.min(batch.remainingQty, remainingToIssue);
    batch.remainingQty -= issueQty;
    await batch.save();

    remainingToIssue -= issueQty;
    totalCost += issueQty * batch.costPrice;
    consumedBatches.push({ batchId: batch._id.toString(), qty: issueQty, unitCost: batch.costPrice });
  }

  if (remainingToIssue > 0) {
    throw new Error(`Insufficient stock for product ${params.productId}`);
  }

  await StockMovementModel.create({
    productId: params.productId,
    outletId: params.outletId,
    type: params.type || 'issue',
    qty: -params.qty,
    valuationCost: totalCost,
    referenceId: params.referenceId,
    userId: params.userId,
    note: params.note
  });

  io?.to(`outlet:${params.outletId}`).emit('stock:changed', {
    productId: params.productId,
    outletId: params.outletId,
    qtyDelta: -params.qty,
    valuationCost: totalCost
  });

  return { totalCost, consumedBatches };
}

export async function adjustStock(params: {
  outletId: string;
  productId: string;
  qty: number;
  reason: string;
  userId?: string;
  valuationMethod?: ValuationMethod;
}): Promise<{ adjustmentCost: number }> {
  if (params.qty === 0) return { adjustmentCost: 0 };

  if (params.qty > 0) {
    const unitCost = await getLastCost(params.productId, params.outletId);
    await receiveStock({
      outletId: params.outletId,
      lines: [
        {
          productId: params.productId,
          qty: params.qty,
          costPrice: unitCost,
          batchNo: `ADJ-${Date.now()}`
        }
      ],
      referenceId: `ADJ-${Date.now()}`,
      type: 'receive',
      note: `Adjustment + (${params.reason})`,
      userId: params.userId
    });

    await StockMovementModel.create({
      productId: params.productId,
      outletId: params.outletId,
      type: 'adjust',
      qty: params.qty,
      valuationCost: params.qty * unitCost,
      userId: params.userId,
      note: params.reason
    });

    return { adjustmentCost: params.qty * unitCost };
  }

  const consumed = await consumeStock({
    outletId: params.outletId,
    productId: params.productId,
    qty: Math.abs(params.qty),
    type: 'adjust',
    note: params.reason,
    userId: params.userId,
    valuationMethod: params.valuationMethod
  });

  return { adjustmentCost: consumed.totalCost };
}

export async function transferStock(params: {
  fromOutletId: string;
  toOutletId: string;
  productId: string;
  qty: number;
  userId?: string;
}): Promise<void> {
  const issued = await consumeStock({
    outletId: params.fromOutletId,
    productId: params.productId,
    qty: params.qty,
    type: 'transfer',
    note: `Transfer to ${params.toOutletId}`,
    userId: params.userId
  });

  const avgCost = issued.totalCost / params.qty;
  await receiveStock({
    outletId: params.toOutletId,
    lines: [
      {
        productId: params.productId,
        qty: params.qty,
        costPrice: avgCost,
        batchNo: `TRF-${Date.now()}`
      }
    ],
    referenceId: `TRF-${Date.now()}`,
    type: 'receive',
    note: `Transfer from ${params.fromOutletId}`,
    userId: params.userId
  });
}

export async function getInventoryValuation(outletId?: string): Promise<{
  items: Array<{ productId: string; qty: number; value: number }>;
  totalValue: number;
}> {
  const match = outletId ? { outletId } : {};
  const batches = await InventoryBatchModel.aggregate([
    { $match: { ...match, remainingQty: { $gt: 0 } } },
    {
      $group: {
        _id: '$productId',
        qty: { $sum: '$remainingQty' },
        value: { $sum: { $multiply: ['$remainingQty', '$costPrice'] } }
      }
    }
  ]);

  const items = batches.map((b) => ({ productId: b._id.toString(), qty: b.qty, value: b.value }));
  const totalValue = items.reduce((sum, i) => sum + i.value, 0);

  return { items, totalValue };
}

export async function getInventoryAgeing(outletId?: string): Promise<Array<{ bucket: string; qty: number; value: number }>> {
  const now = new Date();
  const thirty = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninety = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const match = outletId ? { outletId } : {};
  const batches = await InventoryBatchModel.find({ ...match, remainingQty: { $gt: 0 } }).lean();

  const result = {
    '0-30': { qty: 0, value: 0 },
    '31-90': { qty: 0, value: 0 },
    '90+': { qty: 0, value: 0 }
  };

  for (const b of batches) {
    const value = b.remainingQty * b.costPrice;
    if (b.createdAt >= thirty) {
      result['0-30'].qty += b.remainingQty;
      result['0-30'].value += value;
    } else if (b.createdAt >= ninety) {
      result['31-90'].qty += b.remainingQty;
      result['31-90'].value += value;
    } else {
      result['90+'].qty += b.remainingQty;
      result['90+'].value += value;
    }
  }

  return Object.entries(result).map(([bucket, data]) => ({ bucket, ...data }));
}

async function getLastCost(productId: string, outletId: string): Promise<number> {
  const last = await InventoryBatchModel.findOne({ productId, outletId }).sort({ createdAt: -1 }).lean();
  return last?.costPrice ?? 0;
}
