import { Request, Response } from 'express';
import { login, logout, refresh, registerUser } from '../services/auth.service';

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const tokens = await login(req.body.email, req.body.password);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
}

export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    await registerUser(req.body);
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const tokens = await refresh(refreshToken);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  await logout(refreshToken);
  res.status(204).send();
}
