import { Request, Response } from 'express';
import AccountModel from '../models/Account';
import { bankReconcile, getLedger, postJournal } from '../services/accounting.service';

export async function coa(req: Request, res: Response): Promise<void> {
  const filter = req.query.outletId ? { outletId: req.query.outletId } : {};
  const accounts = await AccountModel.find(filter).sort({ code: 1 }).lean();
  res.json(accounts);
}

export async function manualJournal(req: Request, res: Response): Promise<void> {
  const result = await postJournal(req.body);
  res.status(201).json(result);
}

export async function ledger(req: Request, res: Response): Promise<void> {
  const outletId = req.query.outletId as string;
  const data = await getLedger(outletId, String(req.params.accountId));
  res.json(data);
}

export async function reconcile(req: Request, res: Response): Promise<void> {
  const data = await bankReconcile({
    outletId: req.body.outletId,
    accountId: req.body.accountId,
    toDate: new Date(req.body.toDate),
    statementBalance: req.body.statementBalance
  });

  res.json(data);
}
