import { describe, expect, it, jest } from '@jest/globals';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../../src/services/pos.service', () => ({
  createOrder: jest.fn(async () => ({ orderId: '65f000000000000000000501', orderNo: 'ORD-1' })),
  holdOrder: jest.fn(async () => undefined),
  recallOrder: jest.fn(async () => undefined),
  settleOrder: jest.fn(async () => ({ orderId: '65f000000000000000000501', cogsAmount: 9.5 })),
  returnOrder: jest.fn(async () => undefined),
  shiftReport: jest.fn(async () => ({ shiftId: '65f000000000000000000601', totalSales: 100, orderCount: 3, paymentBreakdown: { cash: 100 } }))
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

describe('integration POS API flow', () => {
  it('create-order and settle endpoints return success', async () => {
    const auth = `Bearer ${token()}`;

    const created = await supertest(app)
      .post('/api/pos/create-order')
      .set('Authorization', auth)
      .send({
        outletId: '65f000000000000000000001',
        orderType: 'dine-in',
        createdBy: '65f000000000000000000101',
        orderLines: [{ productId: '65f000000000000000000201', qty: 2 }]
      });

    expect(created.status).toBe(201);
    expect(created.body.orderNo).toBe('ORD-1');

    const settled = await supertest(app)
      .post('/api/pos/settle')
      .set('Authorization', auth)
      .send({
        orderId: created.body.orderId,
        userId: '65f000000000000000000101',
        payments: [{ method: 'cash', amount: 100 }]
      });

    expect(settled.status).toBe(200);
    expect(settled.body.cogsAmount).toBe(9.5);
  });
});
