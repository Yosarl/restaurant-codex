import { Schema, model } from 'mongoose';

export interface Role {
  name: string;
  permissions: string[];
}

const roleSchema = new Schema<Role>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    permissions: [{ type: String, required: true }]
  },
  { timestamps: true }
);

export default model<Role>('Role', roleSchema);
