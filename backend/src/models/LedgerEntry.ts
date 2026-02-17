import { Schema, model, Types } from 'mongoose';

export interface LedgerEntry {
  outletId: Types.ObjectId;
  accountId: Types.ObjectId;
  journalEntryId: Types.ObjectId;
  date: Date;
  debit: number;
  credit: number;
  runningBalance: number;
  referenceType: string;
  referenceId?: string;
}

const ledgerEntrySchema = new Schema<LedgerEntry>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    journalEntryId: { type: Schema.Types.ObjectId, ref: 'JournalEntry', required: true, index: true },
    date: { type: Date, required: true, index: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    runningBalance: { type: Number, required: true },
    referenceType: { type: String, required: true },
    referenceId: String
  },
  { timestamps: true }
);

ledgerEntrySchema.index({ outletId: 1, accountId: 1, date: 1 });

export default model<LedgerEntry>('LedgerEntry', ledgerEntrySchema);
