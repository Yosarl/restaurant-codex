import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from '../models/User';
import RoleModel from '../models/Role';
import { getPagination } from '../utils/pagination';
import { env } from '../config/env';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const { limit, skip, page } = getPagination(req);
  const [items, total] = await Promise.all([
    UserModel.find().populate('roleId').populate('outlets').skip(skip).limit(limit).lean(),
    UserModel.countDocuments()
  ]);

  res.json({ items, meta: { page, limit, total } });
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const passwordHash = await bcrypt.hash(req.body.password, env.BCRYPT_ROUNDS);
  const user = await UserModel.create({ ...req.body, passwordHash });
  res.status(201).json(user);
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json(user);
}

export async function listRoles(_req: Request, res: Response): Promise<void> {
  const roles = await RoleModel.find().lean();
  res.json(roles);
}
