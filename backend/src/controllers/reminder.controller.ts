import { Request, Response } from 'express';
import { ReminderModel, CreateReminderData } from '../models/Reminder';
import { logger } from '../utils/logger';

export const reminderController = {
  // Get all reminders for a specific entity
  getByEntity: async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const includeCompleted = req.query.includeCompleted === 'true';
      
      const reminders = await ReminderModel.findByEntity(entityType, parseInt(entityId), includeCompleted);
      res.json(reminders);
    } catch (error: any) {
      logger.error('Error fetching reminders by entity:', error);
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  },

  // Get all reminders for the current user
  getMyReminders: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const includeCompleted = req.query.includeCompleted === 'true';
      const reminders = await ReminderModel.findByUser(userId, includeCompleted);
      res.json(reminders);
    } catch (error: any) {
      logger.error('Error fetching user reminders:', error);
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  },

  // Get due reminders (next X days)
  getDueReminders: async (req: Request, res: Response) => {
    try {
      const daysAhead = parseInt(req.query.days as string) || 7;
      const reminders = await ReminderModel.findDueReminders(daysAhead);
      res.json(reminders);
    } catch (error: any) {
      logger.error('Error fetching due reminders:', error);
      res.status(500).json({ error: 'Failed to fetch due reminders' });
    }
  },

  // Get overdue reminders
  getOverdueReminders: async (req: Request, res: Response) => {
    try {
      const reminders = await ReminderModel.findOverdue();
      res.json(reminders);
    } catch (error: any) {
      logger.error('Error fetching overdue reminders:', error);
      res.status(500).json({ error: 'Failed to fetch overdue reminders' });
    }
  },

  // Get a single reminder by ID
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reminder = await ReminderModel.findById(parseInt(id));
      
      if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }
      
      res.json(reminder);
    } catch (error: any) {
      logger.error('Error fetching reminder:', error);
      res.status(500).json({ error: 'Failed to fetch reminder' });
    }
  },

  // Create a new reminder
  create: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data: CreateReminderData = {
        ...req.body,
        created_by_user_id: userId,
      };

      const reminder = await ReminderModel.create(data);
      res.status(201).json(reminder);
    } catch (error: any) {
      logger.error('Error creating reminder:', error);
      res.status(500).json({ error: 'Failed to create reminder' });
    }
  },

  // Update a reminder
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reminder = await ReminderModel.update(parseInt(id), req.body);
      res.json(reminder);
    } catch (error: any) {
      logger.error('Error updating reminder:', error);
      res.status(500).json({ error: 'Failed to update reminder' });
    }
  },

  // Complete a reminder
  complete: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const reminder = await ReminderModel.complete(parseInt(id), userId);
      res.json(reminder);
    } catch (error: any) {
      logger.error('Error completing reminder:', error);
      res.status(500).json({ error: 'Failed to complete reminder' });
    }
  },

  // Uncomplete a reminder
  uncomplete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reminder = await ReminderModel.uncomplete(parseInt(id));
      res.json(reminder);
    } catch (error: any) {
      logger.error('Error uncompleting reminder:', error);
      res.status(500).json({ error: 'Failed to uncomplete reminder' });
    }
  },

  // Delete a reminder
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await ReminderModel.delete(parseInt(id));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting reminder:', error);
      res.status(500).json({ error: 'Failed to delete reminder' });
    }
  },
};








