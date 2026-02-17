import PurchaseInvoiceModel from '../models/PurchaseInvoice';
import PurchaseOrderModel from '../models/PurchaseOrder';
import SupplierModel from '../models/Supplier';
import { receiveStock, consumeStock } from './inventory.service';
import { postPurchaseAccounting } from './accounting.service';

export async function createPurchaseOrder(payload: {
  outletId: string;
  supplierId: string;
  expectedDate?: Date;
  lines: Array<{ productId: string; qty: number; unitCost: number }>;
  notes?: string;
  createdBy: string;
}): Promise<{ poId: string; orderNo: string }> {
  const orderNo = `PO-${Date.now()}`;
  const po = await PurchaseOrderModel.create({
    outletId: payload.outletId,
    supplierId: payload.supplierId,
    orderNo,
    status: 'approved',
    expectedDate: payload.expectedDate,
    lines: payload.lines,
    notes: payload.notes,
    createdBy: payload.createdBy
  });

  return { poId: po._id.toString(), orderNo };
}

export async function listPurchaseOrders(filter: { outletId?: string; supplierId?: string }): Promise<unknown[]> {
  const query: Record<string, unknown> = {};
  if (filter.outletId) query.outletId = filter.outletId;
  if (filter.supplierId) query.supplierId = filter.supplierId;

  return PurchaseOrderModel.find(query).sort({ createdAt: -1 }).lean();
}

export async function createPurchaseInvoice(payload: {
  outletId: string;
  supplierId: string;
  poId?: string;
  lines: Array<{ productId: string; qty: number; unitCost: number; taxRate: number; batchNo: string; expiryDate?: Date }>;
  paidAmount?: number;
  createdBy: string;
}): Promise<{ invoiceId: string; invoiceNo: string }> {
  const subtotal = payload.lines.reduce((sum, l) => sum + l.qty * l.unitCost, 0);
  const tax = payload.lines.reduce((sum, l) => sum + l.qty * l.unitCost * l.taxRate, 0);
  const total = subtotal + tax;
  const paidAmount = payload.paidAmount || 0;

  const invoiceNo = `PI-${Date.now()}`;
  const invoice = await PurchaseInvoiceModel.create({
    outletId: payload.outletId,
    supplierId: payload.supplierId,
    poId: payload.poId,
    invoiceNo,
    status: paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partially_paid' : 'unpaid',
    lines: payload.lines,
    subtotal,
    tax,
    total,
    paidAmount,
    creditNoteAmount: 0,
    createdBy: payload.createdBy
  });

  await receiveStock({
    outletId: payload.outletId,
    referenceId: invoice._id.toString(),
    note: `Purchase invoice ${invoiceNo}`,
    userId: payload.createdBy,
    lines: payload.lines.map((l) => ({
      productId: l.productId,
      qty: l.qty,
      costPrice: l.unitCost,
      batchNo: l.batchNo,
      expiryDate: l.expiryDate
    }))
  });

  await postPurchaseAccounting({
    outletId: payload.outletId,
    invoiceId: invoice._id.toString(),
    subtotal,
    tax,
    total,
    paidAmount,
    createdBy: payload.createdBy
  });

  return { invoiceId: invoice._id.toString(), invoiceNo };
}

export async function purchaseReturn(payload: {
  outletId: string;
  invoiceId: string;
  lines: Array<{ productId: string; qty: number }>;
  reason: string;
  createdBy: string;
}): Promise<{ creditAmount: number }> {
  const invoice = await PurchaseInvoiceModel.findById(payload.invoiceId).lean();
  if (!invoice) throw new Error('Invoice not found');

  let creditAmount = 0;
  for (const line of payload.lines) {
    const original = invoice.lines.find((l) => l.productId.toString() === line.productId);
    if (!original) throw new Error(`Product ${line.productId} missing in invoice`);

    await consumeStock({
      outletId: payload.outletId,
      productId: line.productId,
      qty: line.qty,
      type: 'return',
      referenceId: payload.invoiceId,
      note: payload.reason,
      userId: payload.createdBy
    });

    creditAmount += line.qty * original.unitCost * (1 + original.taxRate);
  }

  await PurchaseInvoiceModel.findByIdAndUpdate(payload.invoiceId, {
    $inc: { creditNoteAmount: creditAmount }
  });

  return { creditAmount };
}

export async function supplierLedger(supplierId: string): Promise<{
  supplier: unknown;
  invoices: unknown[];
}> {
  const supplier = await SupplierModel.findById(supplierId).lean();
  const invoices = await PurchaseInvoiceModel.find({ supplierId }).sort({ createdAt: -1 }).lean();

  return { supplier, invoices };
}
