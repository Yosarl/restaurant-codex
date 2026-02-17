import { Schema, model, Types } from 'mongoose';

export interface AuditLog {
  userId?: Types.ObjectId;
  outletId?: Types.ObjectId;
  action: string;
  model: string;
  modelId?: string;
  changes?: Record<string, unknown>;
  timestamp: Date;
}

const auditLogSchema = new Schema<AuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    action: { type: String, required: true, index: true },
    model: { type: String, required: true, index: true },
    modelId: { type: String, index: true },
    changes: { type: Schema.Types.Mixed },
    timestamp: { type: Date, required: true, index: true }
  },
  { timestamps: false }
);

auditLogSchema.index({ model: 1, modelId: 1, timestamp: -1 });

export default model<AuditLog>('AuditLog', auditLogSchema);
