import { Request, Response } from 'express';
import OutletModel from '../models/Outlet';
import { getPagination } from '../utils/pagination';

export async function listOutlets(req: Request, res: Response): Promise<void> {
  const { page, limit, skip } = getPagination(req);
  const [items, total] = await Promise.all([
    OutletModel.find().skip(skip).limit(limit).lean(),
    OutletModel.countDocuments()
  ]);

  res.json({ items, meta: { page, limit, total } });
}

export async function createOutlet(req: Request, res: Response): Promise<void> {
  const outlet = await OutletModel.create(req.body);
  res.status(201).json(outlet);
}

export async function updateOutlet(req: Request, res: Response): Promise<void> {
  const outlet = await OutletModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!outlet) {
    res.status(404).json({ message: 'Outlet not found' });
    return;
  }
  res.json(outlet);
}
