import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PipelineService } from '../services/pipeline.service';

export class PipelineController {
  static async getPipelineStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const userId = req.user?.userId;

      if (!type) {
        const allStats = await PipelineService.getAllPipelineStats(userId);
        return res.json(allStats);
      }

      const stats = await PipelineService.getPipelineStats(type, userId);
      res.json(stats);
    } catch (error: any) {
      next(error);
    }
  }

  static async getProjectsByStep(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, step } = req.params;
      const userId = req.user?.userId;

      if (!type || !step) {
        return res.status(400).json({ error: 'Type and step are required' });
      }

      const projects = await PipelineService.getProjectsByPipelineStep(type, step, userId);
      res.json(projects);
    } catch (error: any) {
      next(error);
    }
  }

  static async moveProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { stepId, newStepId } = req.body;
      const targetStepId = newStepId || stepId;

      if (!targetStepId) {
        return res.status(400).json({ error: 'stepId or newStepId is required' });
      }

      await PipelineService.moveProjectToStep(parseInt(projectId), targetStepId);
      res.json({ message: 'Project moved successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

