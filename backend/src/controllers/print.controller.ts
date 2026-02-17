import { Request, Response } from 'express';
import OrderModel from '../models/Order';
import { buildReceiptPdf, enqueueKOT, getPrintQueue } from '../services/print.service';

export async function printReceipt(req: Request, res: Response): Promise<void> {
  const order = await OrderModel.findById(req.params.orderId).lean();
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  const pdf = await buildReceiptPdf({
    orderNo: order.orderNo,
    total: order.total,
    lines: order.orderLines.map((l) => ({
      name: l.productName,
      qty: l.qty,
      unitPrice: l.unitPrice,
      total: l.lineTotal
    }))
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=receipt-${order.orderNo}.pdf`);
  res.send(pdf);
}

export async function printKot(req: Request, res: Response): Promise<void> {
  enqueueKOT(req.body);
  res.status(202).json({ message: 'KOT queued' });
}

export async function printQueue(req: Request, res: Response): Promise<void> {
  res.json(getPrintQueue());
}
