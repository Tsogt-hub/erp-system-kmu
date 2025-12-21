import { Request, Response } from 'express';
import { ChecklistModel, CreateChecklistData, CreateChecklistItemData } from '../models/Checklist';
import { logger } from '../utils/logger';

export const checklistController = {
  // Get checklists by entity
  getByEntity: async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const checklists = await ChecklistModel.findByEntity(entityType, parseInt(entityId));
      res.json(checklists);
    } catch (error: any) {
      logger.error('Error fetching checklists:', error);
      res.status(500).json({ error: 'Failed to fetch checklists' });
    }
  },

  // Get templates
  getTemplates: async (_req: Request, res: Response) => {
    try {
      const templates = await ChecklistModel.findTemplates();
      res.json(templates);
    } catch (error: any) {
      logger.error('Error fetching checklist templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  },

  // Get single checklist
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const checklist = await ChecklistModel.findById(parseInt(id));
      if (!checklist) {
        return res.status(404).json({ error: 'Checklist not found' });
      }
      res.json(checklist);
    } catch (error: any) {
      logger.error('Error fetching checklist:', error);
      res.status(500).json({ error: 'Failed to fetch checklist' });
    }
  },

  // Create checklist
  create: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data: CreateChecklistData = {
        ...req.body,
        created_by: userId,
      };

      const checklist = await ChecklistModel.create(data);
      res.status(201).json(checklist);
    } catch (error: any) {
      logger.error('Error creating checklist:', error);
      res.status(500).json({ error: 'Failed to create checklist' });
    }
  },

  // Create from template
  createFromTemplate: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { templateId } = req.params;
      const { entityType, entityId } = req.body;

      const checklist = await ChecklistModel.createFromTemplate(
        parseInt(templateId),
        entityType,
        entityId,
        userId
      );
      res.status(201).json(checklist);
    } catch (error: any) {
      logger.error('Error creating checklist from template:', error);
      res.status(500).json({ error: 'Failed to create checklist from template' });
    }
  },

  // Update checklist
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const checklist = await ChecklistModel.update(parseInt(id), req.body);
      res.json(checklist);
    } catch (error: any) {
      logger.error('Error updating checklist:', error);
      res.status(500).json({ error: 'Failed to update checklist' });
    }
  },

  // Delete checklist
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await ChecklistModel.delete(parseInt(id));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting checklist:', error);
      res.status(500).json({ error: 'Failed to delete checklist' });
    }
  },

  // Add item
  addItem: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data: CreateChecklistItemData = {
        ...req.body,
        checklist_id: parseInt(id),
      };
      const item = await ChecklistModel.addItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      logger.error('Error adding checklist item:', error);
      res.status(500).json({ error: 'Failed to add item' });
    }
  },

  // Update item
  updateItem: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const item = await ChecklistModel.updateItem(parseInt(itemId), req.body);
      res.json(item);
    } catch (error: any) {
      logger.error('Error updating checklist item:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  },

  // Toggle item completion
  toggleItem: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { itemId } = req.params;
      const item = await ChecklistModel.toggleItem(parseInt(itemId), userId);
      res.json(item);
    } catch (error: any) {
      logger.error('Error toggling checklist item:', error);
      res.status(500).json({ error: 'Failed to toggle item' });
    }
  },

  // Delete item
  deleteItem: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      await ChecklistModel.deleteItem(parseInt(itemId));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting checklist item:', error);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  },
};









