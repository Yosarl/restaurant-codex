import { describe, expect, it, jest } from '@jest/globals';

const saveFirst = jest.fn();
const saveSecond = jest.fn();
const createMovement = jest.fn();

jest.mock('../../src/models/InventoryBatch', () => ({
  __esModule: true,
  default: {
    find: jest.fn(() => ({
      sort: jest.fn(() =>
        Promise.resolve([
          { _id: 'b1', remainingQty: 5, costPrice: 2, save: saveFirst },
          { _id: 'b2', remainingQty: 5, costPrice: 3, save: saveSecond }
        ])
      )
    }))
  }
}));

jest.mock('../../src/models/StockMovement', () => ({
  __esModule: true,
  default: {
    create: createMovement
  }
}));

import { consumeStock } from '../../src/services/inventory.service';

describe('inventory.service', () => {
  it('consumes FIFO and computes valuation cost', async () => {
    const result = await consumeStock({
      outletId: '65f000000000000000000001',
      productId: '65f000000000000000000201',
      qty: 7,
      valuationMethod: 'FIFO'
    });

    expect(result.totalCost).toBe(16);
    expect(result.consumedBatches).toHaveLength(2);
    expect(saveFirst).toHaveBeenCalled();
    expect(saveSecond).toHaveBeenCalled();
    expect(createMovement).toHaveBeenCalled();
  });
});
