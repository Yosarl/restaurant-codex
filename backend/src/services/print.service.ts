import PDFDocument from 'pdfkit';
import { io } from '../config/socket';

const printQueue: Array<{ type: 'receipt' | 'kot'; payload: Record<string, unknown>; createdAt: Date }> = [];

export function enqueueKOT(payload: Record<string, unknown>): void {
  printQueue.push({ type: 'kot', payload, createdAt: new Date() });
  io?.emit('kot:print', payload);
}

export function getPrintQueue(): Array<{ type: 'receipt' | 'kot'; payload: Record<string, unknown>; createdAt: Date }> {
  return printQueue;
}

export async function buildReceiptPdf(payload: {
  orderNo: string;
  lines: Array<{ name: string; qty: number; unitPrice: number; total: number }>;
  total: number;
}): Promise<Buffer> {
  const doc = new PDFDocument({ size: [220, 600], margin: 10 });
  const chunks: Uint8Array[] = [];

  return new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(14).text('Restaurant Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Order: ${payload.orderNo}`);
    doc.text(`Date: ${new Date().toISOString()}`);
    doc.moveDown();

    payload.lines.forEach((line) => {
      doc.text(`${line.qty} x ${line.name}`);
      doc.text(`${line.total.toFixed(2)}`, { align: 'right' });
    });

    doc.moveDown();
    doc.fontSize(12).text(`TOTAL: ${payload.total.toFixed(2)}`, { align: 'right' });
    doc.end();
  });
}
