import { describe, expect, it } from '@jest/globals';
import { postJournal } from '../../src/services/accounting.service';

describe('accounting.service', () => {
  it('throws on unbalanced journal before persistence', async () => {
    await expect(
      postJournal({
        outletId: '65f000000000000000000001',
        referenceType: 'manual',
        description: 'invalid',
        lines: [
          { accountId: '65f000000000000000000101', debit: 100, credit: 0 },
          { accountId: '65f000000000000000000102', debit: 0, credit: 99 }
        ]
      })
    ).rejects.toThrow('Unbalanced');
  });
});
