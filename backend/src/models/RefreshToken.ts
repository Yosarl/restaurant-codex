import { Schema, model } from 'mongoose';

export interface RefreshToken {
  userId: Schema.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
}

const refreshTokenSchema = new Schema<RefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: Date
  },
  { timestamps: true }
);

export default model<RefreshToken>('RefreshToken', refreshTokenSchema);
