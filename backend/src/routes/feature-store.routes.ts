import { Router } from 'express';
import { FeatureStoreController } from '../controllers/feature-store.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { accessGuard } from '../middleware/accessGuard';

const router = Router();

router.use(authMiddleware);

router.get(
  '/definitions',
  accessGuard({ any: ['feature-store:read'] }),
  FeatureStoreController.listDefinitions
);

router.post(
  '/definitions',
  accessGuard({ any: ['feature-store:write'] }),
  FeatureStoreController.upsertDefinition
);

router.post(
  '/snapshots',
  accessGuard({ any: ['feature-store:write'] }),
  FeatureStoreController.recordSnapshots
);

router.get(
  '/definitions/:name/latest',
  accessGuard({ any: ['feature-store:read'] }),
  FeatureStoreController.latestFeature
);

router.get(
  '/definitions/:name/timeseries',
  accessGuard({ any: ['feature-store:read'] }),
  FeatureStoreController.getTimeSeries
);

router.post(
  '/projects/refresh',
  accessGuard({ any: ['feature-store:sync', 'feature-store:write'] }),
  FeatureStoreController.refreshProjectCapacity
);

router.post(
  '/projects/forecast',
  accessGuard({ any: ['feature-store:sync', 'feature-store:write'] }),
  FeatureStoreController.refreshProjectCapacityForecast
);

export default router;


