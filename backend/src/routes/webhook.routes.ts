import { Router } from 'express';
import { paymentWebhook } from '../controllers/webhook.controller';

const router = Router();

router.post('/payment/:provider', paymentWebhook);

export default router;
