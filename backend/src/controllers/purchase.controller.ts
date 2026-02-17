import { Request, Response } from 'express';
import {
  createPurchaseInvoice,
  createPurchaseOrder,
  listPurchaseOrders,
  purchaseReturn
} from '../services/purchase.service';

export async function createPO(req: Request, res: Response): Promise<void> {
  const po = await createPurchaseOrder(req.body);
  res.status(201).json(po);
}

export async function getPOs(req: Request, res: Response): Promise<void> {
  const items = await listPurchaseOrders({
    outletId: req.query.outletId as string | undefined,
    supplierId: req.query.supplierId as string | undefined
  });
  res.json(items);
}

export async function createInvoice(req: Request, res: Response): Promise<void> {
  const invoice = await createPurchaseInvoice(req.body);
  res.status(201).json(invoice);
}

export async function createPurchaseReturn(req: Request, res: Response): Promise<void> {
  const result = await purchaseReturn(req.body);
  res.status(201).json(result);
}
