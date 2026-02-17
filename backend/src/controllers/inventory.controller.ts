import { Request, Response } from 'express';
import { writeAuditLog } from '../middlewares/audit';
import {
  adjustStock,
  getInventoryAgeing,
  getInventoryValuation,
  receiveStock,
  transferStock
} from '../services/inventory.service';
import { postStockAdjustmentAccounting } from '../services/accounting.service';

export async function openingStock(req: Request, res: Response): Promise<void> {
  await receiveStock({
    outletId: req.body.outletId,
    lines: req.body.lines,
    referenceId: req.body.referenceId || `OPEN-${Date.now()}`,
    note: 'Opening stock',
    userId: req.body.userId
  });

  await writeAuditLog({
    userId: req.body.userId,
    outletId: req.body.outletId,
    action: 'opening_stock',
    model: 'InventoryBatch',
    changes: req.body
  });

  res.status(201).json({ message: 'Opening stock recorded' });
}

export async function receiveInventory(req: Request, res: Response): Promise<void> {
  await receiveStock({
    outletId: req.body.outletId,
    lines: req.body.lines,
    referenceId: req.body.referenceId,
    note: req.body.note,
    userId: req.body.userId
  });

  res.status(201).json({ message: 'Inventory received' });
}

export async function stockAdjustment(req: Request, res: Response): Promise<void> {
  const result = await adjustStock({
    outletId: req.body.outletId,
    productId: req.body.productId,
    qty: req.body.qty,
    reason: req.body.reason,
    userId: req.body.userId,
    valuationMethod: req.body.valuationMethod
  });

  await postStockAdjustmentAccounting({
    outletId: req.body.outletId,
    adjustmentRef: req.body.referenceId || `ADJ-${Date.now()}`,
    adjustmentValue: req.body.qty > 0 ? result.adjustmentCost : -result.adjustmentCost,
    createdBy: req.body.userId
  });

  await writeAuditLog({
    userId: req.body.userId,
    outletId: req.body.outletId,
    action: 'stock_adjustment',
    model: 'StockMovement',
    changes: req.body
  });

  res.json({ message: 'Stock adjusted', adjustmentCost: result.adjustmentCost });
}

export async function stockTransfer(req: Request, res: Response): Promise<void> {
  await transferStock({
    fromOutletId: req.body.fromOutletId,
    toOutletId: req.body.toOutletId,
    productId: req.body.productId,
    qty: req.body.qty,
    userId: req.body.userId
  });

  await writeAuditLog({
    userId: req.body.userId,
    outletId: req.body.fromOutletId,
    action: 'stock_transfer',
    model: 'StockMovement',
    changes: req.body
  });

  res.json({ message: 'Transfer complete' });
}

export async function valuation(req: Request, res: Response): Promise<void> {
  const data = await getInventoryValuation(req.query.outletId as string | undefined);
  res.json(data);
}

export async function ageing(req: Request, res: Response): Promise<void> {
  const data = await getInventoryAgeing(req.query.outletId as string | undefined);
  res.json(data);
}
