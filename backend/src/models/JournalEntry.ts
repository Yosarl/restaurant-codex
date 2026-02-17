import { Schema, model, Types } from 'mongoose';

export interface JournalEntry {
  outletId: Types.ObjectId;
  date: Date;
  referenceType: string;
  referenceId?: string;
  description: string;
  lines: Array<{
    accountId: Types.ObjectId;
    debit: number;
    credit: number;
    note?: string;
  }>;
  createdBy?: Types.ObjectId;
}

const journalEntrySchema = new Schema<JournalEntry>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    date: { type: Date, required: true, index: true },
    referenceType: { type: String, required: true, index: true },
    referenceId: { type: String, index: true },
    description: { type: String, required: true },
    lines: [
      {
        accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
        debit: { type: Number, default: 0 },
        credit: { type: Number, default: 0 },
        note: String
      }
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

journalEntrySchema.index({ outletId: 1, referenceType: 1, referenceId: 1 });

export default model<JournalEntry>('JournalEntry', journalEntrySchema);
