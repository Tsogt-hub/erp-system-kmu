import { Router } from 'express';
import { PipelineController } from '../controllers/pipeline.controller';
import { PipelineModel } from '../models/Pipeline';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Alle Pipelines abrufen
router.get('/', authMiddleware, (req, res, next) => {
  try {
    const pipelines = PipelineModel.getPipelines();
    res.json(pipelines);
  } catch (error: any) {
    next(error);
  }
});

// Statistiken für einen spezifischen Pipeline-Typ
router.get('/:type/stats', authMiddleware, (req, res, next) => PipelineController.getPipelineStats(req as any, res, next));

// Projekte für einen bestimmten Pipeline-Schritt
router.get('/:type/:step/projects', authMiddleware, (req, res, next) => PipelineController.getProjectsByStep(req as any, res, next));

// Projekt zu einem anderen Schritt verschieben
router.put('/:projectId/move', authMiddleware, (req, res, next) => PipelineController.moveProject(req as any, res, next));

export default router;

