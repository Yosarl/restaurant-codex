import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserModel from '../models/User';
import RoleModel from '../models/Role';
import RefreshTokenModel from '../models/RefreshToken';
import { env } from '../config/env';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  outlets: string[];
  permissions: string[];
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  roleId: string;
  outlets: string[];
}): Promise<void> {
  const exists = await UserModel.exists({ email: payload.email.toLowerCase() });
  if (exists) {
    throw new Error('Email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_ROUNDS);

  await UserModel.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash,
    roleId: payload.roleId,
    outlets: payload.outlets,
    isActive: true
  });
}

function issueAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });
}

function issueRefreshToken(payload: Pick<TokenPayload, 'id' | 'email'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });
}

export async function login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
  const user = await UserModel.findOne({ email: email.toLowerCase(), isActive: true })
    .select('+passwordHash')
    .lean();

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const role = await RoleModel.findById(user.roleId).lean();
  if (!role) {
    throw new Error('Role missing');
  }

  const tokenPayload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: role.name,
    outlets: (user.outlets || []).map((o) => o.toString()),
    permissions: role.permissions
  };

  const accessToken = issueAccessToken(tokenPayload);
  const refreshToken = issueRefreshToken({ id: tokenPayload.id, email: tokenPayload.email });

  const decoded = jwt.decode(refreshToken) as { exp: number };
  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000)
  });

  await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  return { accessToken, refreshToken };
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string; email: string };
  const tokenHash = hashToken(refreshToken);

  const tokenDoc = await RefreshTokenModel.findOne({
    userId: payload.id,
    tokenHash,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  });

  if (!tokenDoc) {
    throw new Error('Refresh token invalid');
  }

  const user = await UserModel.findById(payload.id).lean();
  if (!user || !user.isActive) {
    throw new Error('User inactive');
  }

  const role = await RoleModel.findById(user.roleId).lean();
  if (!role) {
    throw new Error('Role missing');
  }

  await RefreshTokenModel.findByIdAndUpdate(tokenDoc._id, { revokedAt: new Date() });

  const nextPayload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: role.name,
    outlets: (user.outlets || []).map((o) => o.toString()),
    permissions: role.permissions
  };

  const nextAccess = issueAccessToken(nextPayload);
  const nextRefresh = issueRefreshToken({ id: nextPayload.id, email: nextPayload.email });
  const decoded = jwt.decode(nextRefresh) as { exp: number };
  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: hashToken(nextRefresh),
    expiresAt: new Date(decoded.exp * 1000)
  });

  return { accessToken: nextAccess, refreshToken: nextRefresh };
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  await RefreshTokenModel.updateMany(
    { tokenHash, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } }
  );
}
