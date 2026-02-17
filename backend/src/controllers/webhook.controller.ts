import { Request, Response } from 'express';

export async function paymentWebhook(req: Request, res: Response): Promise<void> {
  const payload = req.body;
  const signature = req.headers['x-signature'];

  res.status(202).json({
    accepted: true,
    signature,
    provider: req.params.provider,
    event: payload?.event || 'unknown'
  });
}
