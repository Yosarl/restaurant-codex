import AccountModel from '../models/Account';
import JournalEntryModel from '../models/JournalEntry';
import LedgerEntryModel from '../models/LedgerEntry';

interface PostingLine {
  accountId: string;
  debit: number;
  credit: number;
  note?: string;
}

export async function ensureDefaultAccounts(outletId: string): Promise<void> {
  const defaults = [
    { code: '1100', name: 'Cash', type: 'asset' },
    { code: '1200', name: 'Accounts Receivable', type: 'asset' },
    { code: '1300', name: 'Inventory', type: 'asset' },
    { code: '2100', name: 'Accounts Payable', type: 'liability' },
    { code: '2200', name: 'VAT Payable', type: 'liability' },
    { code: '1150', name: 'VAT Input', type: 'asset' },
    { code: '4100', name: 'Sales Revenue', type: 'revenue' },
    { code: '5100', name: 'COGS', type: 'expense' },
    { code: '5200', name: 'Stock Adjustment Expense', type: 'expense' }
  ] as const;

  for (const account of defaults) {
    await AccountModel.updateOne(
      { code: account.code, outletId },
      {
        $setOnInsert: {
          ...account,
          outletId,
          isSystem: true,
          isActive: true
        }
      },
      { upsert: true }
    );
  }
}

export async function getAccountByCode(outletId: string, code: string): Promise<{ id: string; name: string }> {
  const account = await AccountModel.findOne({ outletId, code }).lean();
  if (!account) {
    throw new Error(`Account ${code} missing for outlet ${outletId}`);
  }
  return { id: account._id.toString(), name: account.name };
}

export async function postJournal(params: {
  outletId: string;
  referenceType: string;
  referenceId?: string;
  description: string;
  date?: Date;
  lines: PostingLine[];
  createdBy?: string;
}): Promise<{ journalEntryId: string }> {
  const totalDebit = params.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = params.lines.reduce((sum, l) => sum + l.credit, 0);

  if (Math.abs(totalDebit - totalCredit) > 0.0001) {
    throw new Error(`Unbalanced journal entry ${totalDebit} != ${totalCredit}`);
  }

  const date = params.date || new Date();
  const journal = await JournalEntryModel.create({
    outletId: params.outletId,
    date,
    referenceType: params.referenceType,
    referenceId: params.referenceId,
    description: params.description,
    lines: params.lines,
    createdBy: params.createdBy
  });

  for (const line of params.lines) {
    const last = await LedgerEntryModel.findOne({
      outletId: params.outletId,
      accountId: line.accountId
    })
      .sort({ date: -1, _id: -1 })
      .lean();

    const lastBalance = last?.runningBalance ?? 0;
    const runningBalance = lastBalance + line.debit - line.credit;

    await LedgerEntryModel.create({
      outletId: params.outletId,
      accountId: line.accountId,
      journalEntryId: journal._id,
      date,
      debit: line.debit,
      credit: line.credit,
      runningBalance,
      referenceType: params.referenceType,
      referenceId: params.referenceId
    });
  }

  return { journalEntryId: journal._id.toString() };
}

export async function postSaleAccounting(params: {
  outletId: string;
  orderId: string;
  total: number;
  tax: number;
  cogsAmount: number;
  createdBy?: string;
}): Promise<void> {
  await ensureDefaultAccounts(params.outletId);

  const cash = await getAccountByCode(params.outletId, '1100');
  const sales = await getAccountByCode(params.outletId, '4100');
  const vat = await getAccountByCode(params.outletId, '2200');
  const cogs = await getAccountByCode(params.outletId, '5100');
  const inventory = await getAccountByCode(params.outletId, '1300');

  const netSales = params.total - params.tax;

  await postJournal({
    outletId: params.outletId,
    referenceType: 'sale',
    referenceId: params.orderId,
    description: `POS Sale ${params.orderId}`,
    lines: [
      { accountId: cash.id, debit: params.total, credit: 0 },
      { accountId: sales.id, debit: 0, credit: netSales },
      { accountId: vat.id, debit: 0, credit: params.tax },
      { accountId: cogs.id, debit: params.cogsAmount, credit: 0 },
      { accountId: inventory.id, debit: 0, credit: params.cogsAmount }
    ],
    createdBy: params.createdBy
  });
}

export async function postPurchaseAccounting(params: {
  outletId: string;
  invoiceId: string;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  createdBy?: string;
}): Promise<void> {
  await ensureDefaultAccounts(params.outletId);

  const inventory = await getAccountByCode(params.outletId, '1300');
  const ap = await getAccountByCode(params.outletId, '2100');
  const vatInput = await getAccountByCode(params.outletId, '1150');
  const cash = await getAccountByCode(params.outletId, '1100');

  await postJournal({
    outletId: params.outletId,
    referenceType: 'purchase',
    referenceId: params.invoiceId,
    description: `Purchase Invoice ${params.invoiceId}`,
    lines: [
      { accountId: inventory.id, debit: params.subtotal, credit: 0 },
      { accountId: vatInput.id, debit: params.tax, credit: 0 },
      { accountId: ap.id, debit: 0, credit: params.total }
    ],
    createdBy: params.createdBy
  });

  if (params.paidAmount > 0) {
    await postJournal({
      outletId: params.outletId,
      referenceType: 'purchase_payment',
      referenceId: params.invoiceId,
      description: `Purchase Payment ${params.invoiceId}`,
      lines: [
        { accountId: ap.id, debit: params.paidAmount, credit: 0 },
        { accountId: cash.id, debit: 0, credit: params.paidAmount }
      ],
      createdBy: params.createdBy
    });
  }
}

export async function postStockAdjustmentAccounting(params: {
  outletId: string;
  adjustmentRef: string;
  adjustmentValue: number;
  createdBy?: string;
}): Promise<void> {
  await ensureDefaultAccounts(params.outletId);
  const inventory = await getAccountByCode(params.outletId, '1300');
  const adj = await getAccountByCode(params.outletId, '5200');

  const abs = Math.abs(params.adjustmentValue);
  const isIncrease = params.adjustmentValue > 0;

  await postJournal({
    outletId: params.outletId,
    referenceType: 'stock_adjustment',
    referenceId: params.adjustmentRef,
    description: `Stock Adjustment ${params.adjustmentRef}`,
    lines: isIncrease
      ? [
          { accountId: inventory.id, debit: abs, credit: 0 },
          { accountId: adj.id, debit: 0, credit: abs }
        ]
      : [
          { accountId: adj.id, debit: abs, credit: 0 },
          { accountId: inventory.id, debit: 0, credit: abs }
        ],
    createdBy: params.createdBy
  });
}

export async function getLedger(outletId: string, accountId: string): Promise<unknown[]> {
  return LedgerEntryModel.find({ outletId, accountId }).sort({ date: 1, _id: 1 }).lean();
}

export async function bankReconcile(params: {
  outletId: string;
  accountId: string;
  toDate: Date;
  statementBalance: number;
}): Promise<{ ledgerBalance: number; difference: number }> {
  const entries = await LedgerEntryModel.find({
    outletId: params.outletId,
    accountId: params.accountId,
    date: { $lte: params.toDate }
  }).lean();

  const ledgerBalance = entries.reduce((sum, e) => sum + e.debit - e.credit, 0);
  return { ledgerBalance, difference: params.statementBalance - ledgerBalance };
}
