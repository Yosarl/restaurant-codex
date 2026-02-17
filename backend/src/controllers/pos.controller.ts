import { Request, Response } from 'express';
import { writeAuditLog } from '../middlewares/audit';
import {
  createOrder,
  holdOrder,
  recallOrder,
  returnOrder,
  settleOrder,
  shiftReport
} from '../services/pos.service';

export async function createPosOrder(req: Request, res: Response): Promise<void> {
  const order = await createOrder({ ...req.body, status: 'open' });
  res.status(201).json(order);
}

export async function holdPosOrder(req: Request, res: Response): Promise<void> {
  const order = await createOrder({ ...req.body, status: 'held' });
  res.status(201).json(order);
}

export async function recallPosOrder(req: Request, res: Response): Promise<void> {
  await recallOrder(req.body.orderId);
  res.json({ message: 'Order recalled' });
}

export async function settlePosOrder(req: Request, res: Response): Promise<void> {
  const result = await settleOrder(req.body);

  await writeAuditLog({
    userId: req.body.userId,
    outletId: req.body.outletId,
    action: 'order_settled',
    model: 'Order',
    modelId: result.orderId,
    changes: req.body
  });

  res.json(result);
}

export async function returnPosOrder(req: Request, res: Response): Promise<void> {
  await returnOrder(req.body);

  await writeAuditLog({
    userId: req.body.userId,
    outletId: req.body.outletId,
    action: 'order_return',
    model: 'Order',
    modelId: req.body.orderId,
    changes: req.body
  });

  res.json({ message: 'Order returned' });
}

export async function settleAlias(req: Request, res: Response): Promise<void> {
  return settlePosOrder(req, res);
}

export async function holdAlias(req: Request, res: Response): Promise<void> {
  await holdOrder(req.body.orderId);
  res.json({ message: 'Order held' });
}

export async function shiftZReport(req: Request, res: Response): Promise<void> {
  const report = await shiftReport(String(req.params.id));
  res.json(report);
}
