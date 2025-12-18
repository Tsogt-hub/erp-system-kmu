import { Request, Response, NextFunction } from 'express';
import { FeatureStoreService } from '../services/feature-store.service';
import { recordAuditEvent } from '../utils/audit';

export class FeatureStoreController {
  static async listDefinitions(_: Request, res: Response, next: NextFunction) {
    try {
      const definitions = await FeatureStoreService.listDefinitions();
      res.json({ data: definitions });
    } catch (error) {
      next(error);
    }
  }

  static async upsertDefinition(req: Request, res: Response, next: NextFunction) {
    try {
      const definition = await FeatureStoreService.upsertDefinition(req.body);
      await recordAuditEvent({
        user_id: (req as any).user?.userId,
        action: 'feature_store.definition.upsert',
        resource: `feature_definition:${definition.id}`,
        level: 'info',
        metadata: { name: definition.name },
      });
      res.status(201).json({ data: definition });
    } catch (error) {
      next(error);
    }
  }

  static async recordSnapshots(req: Request, res: Response, next: NextFunction) {
    try {
      const { definition, snapshots } = req.body;
      if (!definition?.name || !definition?.entity) {
        return res.status(400).json({ error: 'definition.name und definition.entity sind erforderlich' });
      }

      const def = await FeatureStoreService.recordSnapshots(definition.name, definition, snapshots);
      await recordAuditEvent({
        user_id: (req as any).user?.userId,
        action: 'feature_store.snapshots.record',
        resource: `feature_definition:${def.id}`,
        level: 'info',
        metadata: { snapshot_count: snapshots?.length ?? 0 },
      });
      res.status(201).json({ data: def });
    } catch (error) {
      next(error);
    }
  }

  static async latestFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.params;
      const { entityId } = req.query;

      if (!entityId || typeof entityId !== 'string') {
        return res.status(400).json({ error: 'entityId query parameter ist erforderlich' });
      }

      const snapshot = await FeatureStoreService.getLatestFeature(name, entityId);
      res.json({ data: snapshot });
    } catch (error) {
      next(error);
    }
  }

  static async getTimeSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.params;
      const { entityId, limit } = req.query;

      if (!entityId || typeof entityId !== 'string') {
        return res.status(400).json({ error: 'entityId query parameter ist erforderlich' });
      }

      const snapshots = await FeatureStoreService.getTimeSeries(
        name,
        entityId,
        limit ? Number(limit) : 50
      );
      res.json({ data: snapshots });
    } catch (error) {
      next(error);
    }
  }

  static async refreshProjectCapacity(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FeatureStoreService.syncProjectCapacityFeatures();
      await recordAuditEvent({
        user_id: (req as any).user?.userId,
        action: 'feature_store.project_capacity.refresh',
        resource: 'feature_definition:project_capacity_window',
        level: 'info',
        metadata: result,
      });
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async refreshProjectCapacityForecast(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FeatureStoreService.syncProjectCapacityForecasts();
      await recordAuditEvent({
        user_id: (req as any).user?.userId,
        action: 'feature_store.project_capacity.forecast',
        resource: 'feature_definition:project_capacity_forecast',
        level: 'info',
        metadata: result,
      });
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}


