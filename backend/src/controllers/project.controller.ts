import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProjectService } from '../services/project.service';

export class ProjectController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const projects = await ProjectService.getAllProjects(userId);
      res.json(projects);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const project = await ProjectService.getProjectById(id);
      res.json(project);
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const project = await ProjectService.createProject({
        ...req.body,
        created_by: userId,
      });
      res.status(201).json(project);
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const project = await ProjectService.updateProject(id, req.body);
      res.json(project);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await ProjectService.deleteProject(id);
      res.json({ message: 'Project deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  static async getMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const members = await ProjectService.getMembers(projectId);
      res.json(members);
    } catch (error: any) {
      next(error);
    }
  }

  static async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { user_id, role } = req.body;
      await ProjectService.addMember(projectId, user_id, userId, role || 'member');
      res.json({ message: 'Member added successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  static async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const { user_id } = req.body;
      await ProjectService.removeMember(projectId, user_id);
      res.json({ message: 'Member removed successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

