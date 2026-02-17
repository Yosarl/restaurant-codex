import { Schema, model, Types } from 'mongoose';

export interface User {
  name: string;
  email: string;
  passwordHash: string;
  roleId: Types.ObjectId;
  outlets: Types.ObjectId[];
  lastLogin?: Date;
  isActive: boolean;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    outlets: [{ type: Schema.Types.ObjectId, ref: 'Outlet', index: true }],
    lastLogin: Date,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model<User>('User', userSchema);
