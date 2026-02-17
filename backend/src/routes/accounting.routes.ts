import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { coa, ledger, manualJournal, reconcile } from '../controllers/accounting.controller';
import { journalSchema, ledgerSchema, reconcileSchema } from '../validators/accounting.validators';

const router = Router();

router.get('/coa', authRequired, requirePermission('accounting:read'), coa);
router.post('/journal', authRequired, requirePermission('accounting:journal'), validate(journalSchema), manualJournal);
router.get('/ledger/:accountId', authRequired, requirePermission('accounting:read'), validate(ledgerSchema), ledger);
router.post('/reconcile', authRequired, requirePermission('accounting:reconcile'), validate(reconcileSchema), reconcile);

export default router;
