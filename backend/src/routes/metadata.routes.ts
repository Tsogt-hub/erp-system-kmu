import { Router } from 'express';
import { MetadataController } from '../controllers/metadata.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { accessGuard } from '../middleware/accessGuard';

const router = Router();

router.use(authMiddleware);

router.get(
  '/assets',
  accessGuard({ any: ['metadata:read'] }),
  MetadataController.listAssets
);
router.post(
  '/assets',
  accessGuard({ any: ['metadata:write'] }),
  MetadataController.createAsset
);
router.get(
  '/quality-rules',
  accessGuard({ any: ['metadata:read'] }),
  MetadataController.listQualityRules
);
router.post(
  '/quality-rules',
  accessGuard({ any: ['metadata:write'] }),
  MetadataController.createQualityRule
);

export default router;


