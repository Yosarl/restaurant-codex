import AuditLogModel from '../models/AuditLog';

export async function writeAuditLog(payload: {
  userId?: string;
  action: string;
  model: string;
  modelId?: string;
  changes?: Record<string, unknown>;
  outletId?: string;
}): Promise<void> {
  await AuditLogModel.create({
    ...payload,
    timestamp: new Date()
  });
}
