import { Request, Response, NextFunction } from 'express';
import { MetadataService } from '../services/metadata.service';
import { recordAuditEvent } from '../utils/audit';

export class MetadataController {
  static async listAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await MetadataService.listAssets();
      res.json({ data: assets });
    } catch (error) {
      next(error);
    }
  }

  static async createAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await MetadataService.createAsset(req.body);
      const userId = (req as any).user?.userId;
      await recordAuditEvent({
        user_id: userId,
        action: 'metadata.asset.create',
        resource: `data_asset:${asset.id}`,
        level: 'info',
        metadata: { name: asset.name, domain: asset.domain },
      });
      res.status(201).json({ data: asset });
    } catch (error) {
      next(error);
    }
  }

  static async listQualityRules(req: Request, res: Response, next: NextFunction) {
    try {
      const assetId = req.query.assetId ? Number(req.query.assetId) : undefined;
      const rules = await MetadataService.listQualityRules(assetId);
      res.json({ data: rules });
    } catch (error) {
      next(error);
    }
  }

  static async createQualityRule(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await MetadataService.createQualityRule(req.body);
      const userId = (req as any).user?.userId;
      await recordAuditEvent({
        user_id: userId,
        action: 'metadata.rule.create',
        resource: `data_quality_rule:${rule.id}`,
        level: 'info',
        metadata: { asset_id: rule.asset_id, dimension: rule.dimension },
      });
      res.status(201).json({ data: rule });
    } catch (error) {
      next(error);
    }
  }
}


