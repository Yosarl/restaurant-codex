import { Request, Response } from 'express';
import { salesReport, stockValuationReport, pnlReport, vatReport } from '../services/report.service';

function parseRange(req: Request): { from?: Date; to?: Date } {
  return {
    from: req.query.from ? new Date(req.query.from as string) : undefined,
    to: req.query.to ? new Date(req.query.to as string) : undefined
  };
}

export async function sales(req: Request, res: Response): Promise<void> {
  const data = await salesReport({ outletId: req.query.outletId as string | undefined, ...parseRange(req) });
  res.json(data);
}

export async function stockValuation(req: Request, res: Response): Promise<void> {
  const data = await stockValuationReport(req.query.outletId as string | undefined);
  res.json(data);
}

export async function pnl(req: Request, res: Response): Promise<void> {
  const data = await pnlReport({ outletId: req.query.outletId as string | undefined, ...parseRange(req) });
  res.json(data);
}

export async function vat(req: Request, res: Response): Promise<void> {
  const data = await vatReport({ outletId: req.query.outletId as string | undefined, ...parseRange(req) });
  res.json(data);
}
