import { ProjectModel, CreateProjectData } from '../models/Project';
import { UserModel } from '../models/User';
import { NotificationService } from './notification.service';
import { logger } from '../utils/logger';

export class ProjectService {
  static async getAllProjects(userId?: number) {
    return await ProjectModel.findAll(userId);
  }

  static async getProjectById(id: number) {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  static async createProject(data: CreateProjectData) {
    return await ProjectModel.create(data);
  }

  static async updateProject(id: number, data: Partial<CreateProjectData>) {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }
    return await ProjectModel.update(id, data);
  }

  static async deleteProject(id: number) {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }
    await ProjectModel.delete(id);
    return { message: 'Project deleted successfully' };
  }

  static async addMember(projectId: number, userId: number, addedByUserId: number, role: string = 'member') {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const addedBy = await UserModel.findById(addedByUserId);
    if (!addedBy) {
      throw new Error('Added by user not found');
    }

    await ProjectModel.addMember(projectId, userId, role);

    // Benachrichtigung senden
    try {
      await NotificationService.notifyProjectMemberAdded(
        userId,
        projectId,
        project.name,
        `${addedBy.first_name} ${addedBy.last_name}`
      );
      logger.info(`📬 Benachrichtigung gesendet an User ${userId} für Projekt ${projectId}`);
    } catch (error: any) {
      logger.error('Fehler beim Senden der Benachrichtigung:', error.message);
      // Benachrichtigung-Fehler sollte nicht das Hinzufügen des Members blockieren
    }

    return { message: 'Member added successfully' };
  }

  static async removeMember(projectId: number, userId: number) {
    await ProjectModel.removeMember(projectId, userId);
    return { message: 'Member removed successfully' };
  }

  static async getMembers(projectId: number) {
    return await ProjectModel.getMembers(projectId);
  }
}

