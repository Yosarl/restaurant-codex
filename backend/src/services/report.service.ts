import OrderModel from '../models/Order';
import StockMovementModel from '../models/StockMovement';
import LedgerEntryModel from '../models/LedgerEntry';
import ProductModel from '../models/Product';
import { getInventoryValuation } from './inventory.service';

export async function salesReport(query: {
  outletId?: string;
  from?: Date;
  to?: Date;
}): Promise<unknown> {
  const match: Record<string, unknown> = { status: 'settled' };
  if (query.outletId) match.outletId = query.outletId;
  if (query.from || query.to) {
    match.createdAt = {
      ...(query.from ? { $gte: query.from } : {}),
      ...(query.to ? { $lte: query.to } : {})
    };
  }

  const byItem = await OrderModel.aggregate([
    { $match: match },
    { $unwind: '$orderLines' },
    {
      $group: {
        _id: '$orderLines.productId',
        qty: { $sum: '$orderLines.qty' },
        sales: { $sum: '$orderLines.lineTotal' }
      }
    }
  ]);

  const hourly = await OrderModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        sales: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return { byItem, hourly };
}

export async function stockValuationReport(outletId?: string): Promise<unknown> {
  return getInventoryValuation(outletId);
}

export async function pnlReport(params: {
  outletId?: string;
  from?: Date;
  to?: Date;
}): Promise<{
  revenue: number;
  expenses: number;
  netProfit: number;
}> {
  const match: Record<string, unknown> = {};
  if (params.outletId) match.outletId = params.outletId;
  if (params.from || params.to) {
    match.date = {
      ...(params.from ? { $gte: params.from } : {}),
      ...(params.to ? { $lte: params.to } : {})
    };
  }

  const entries = await LedgerEntryModel.find(match).populate('accountId').lean();

  let revenue = 0;
  let expenses = 0;
  for (const e of entries as Array<{ debit: number; credit: number; accountId: { type?: string } }>) {
    if (e.accountId?.type === 'revenue') revenue += e.credit - e.debit;
    if (e.accountId?.type === 'expense') expenses += e.debit - e.credit;
  }

  return { revenue, expenses, netProfit: revenue - expenses };
}

export async function vatReport(params: {
  outletId?: string;
  from?: Date;
  to?: Date;
}): Promise<{ outputVat: number; inputVat: number; payable: number }> {
  const match: Record<string, unknown> = {};
  if (params.outletId) match.outletId = params.outletId;
  if (params.from || params.to) {
    match.date = {
      ...(params.from ? { $gte: params.from } : {}),
      ...(params.to ? { $lte: params.to } : {})
    };
  }

  const entries = await LedgerEntryModel.find(match).populate('accountId').lean();

  let outputVat = 0;
  let inputVat = 0;

  for (const e of entries as Array<{ debit: number; credit: number; accountId: { code?: string } }>) {
    if (e.accountId?.code === '2200') outputVat += e.credit - e.debit;
    if (e.accountId?.code === '1150') inputVat += e.debit - e.credit;
  }

  return { outputVat, inputVat, payable: outputVat - inputVat };
}

export async function lowStockAlerts(outletId?: string): Promise<unknown[]> {
  const filter = outletId ? { outletId } : {};
  const products = await ProductModel.find(filter).lean();
  const movements = await StockMovementModel.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$productId',
        qty: { $sum: '$qty' }
      }
    }
  ]);

  const map = new Map(movements.map((m) => [m._id.toString(), m.qty as number]));
  return products.filter((p) => (map.get(p._id.toString()) || 0) <= p.reorderLevel);
}
