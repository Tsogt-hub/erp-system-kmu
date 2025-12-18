import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { accessGuard } from '../middleware/accessGuard';

const router = Router();

router.use(authMiddleware);
router.get('/', accessGuard({ any: ['audit:read', 'governance:manage'] }), AuditController.list);

export default router;


