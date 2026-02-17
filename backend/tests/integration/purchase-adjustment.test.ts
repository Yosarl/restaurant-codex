import { describe, expect, it, jest } from '@jest/globals';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../../src/services/purchase.service', () => ({
  createPurchaseOrder: jest.fn(async () => ({ poId: '65f000000000000000000701', orderNo: 'PO-1' })),
  listPurchaseOrders: jest.fn(async () => [{ orderNo: 'PO-1' }]),
  createPurchaseInvoice: jest.fn(async () => ({ invoiceId: '65f000000000000000000801', invoiceNo: 'PI-1' })),
  purchaseReturn: jest.fn(async () => ({ creditAmount: 15 }))
}));

jest.mock('../../src/services/inventory.service', () => ({
  receiveStock: jest.fn(async () => undefined),
  adjustStock: jest.fn(async () => ({ adjustmentCost: 12 })),
  transferStock: jest.fn(async () => undefined),
  getInventoryValuation: jest.fn(async () => ({ items: [], totalValue: 0 })),
  getInventoryAgeing: jest.fn(async () => [])
}));

jest.mock('../../src/services/accounting.service', () => ({
  postStockAdjustmentAccounting: jest.fn(async () => undefined)
}));

jest.mock('../../src/middlewares/audit', () => ({
  writeAuditLog: jest.fn(async () => undefined)
}));

import app from '../../src/app';

function token(): string {
  return jwt.sign(
    {
      id: '65f000000000000000000101',
      email: 'admin@test.local',
      role: 'Super Admin',
      outlets: ['65f000000000000000000001'],
      permissions: ['*']
    },
    process.env.JWT_ACCESS_SECRET as string
  );
}

describe('integration purchase + inventory adjustment API', () => {
  it('creates purchase invoice and stock adjustment', async () => {
    const auth = `Bearer ${token()}`;

    const invoice = await supertest(app)
      .post('/api/purchase/invoices')
      .set('Authorization', auth)
      .send({
        outletId: '65f000000000000000000001',
        supplierId: '65f000000000000000000301',
        createdBy: '65f000000000000000000101',
        lines: [{ productId: '65f000000000000000000201', qty: 5, unitCost: 2, taxRate: 0.12, batchNo: 'B1' }]
      });

    expect(invoice.status).toBe(201);
    expect(invoice.body.invoiceNo).toBe('PI-1');

    const adjustment = await supertest(app)
      .post('/api/inventory/adjustment')
      .set('Authorization', auth)
      .send({
        outletId: '65f000000000000000000001',
        productId: '65f000000000000000000201',
        qty: -2,
        reason: 'damaged',
        userId: '65f000000000000000000101'
      });

    expect(adjustment.status).toBe(200);
    expect(adjustment.body.adjustmentCost).toBe(12);
  });
});
