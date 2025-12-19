import { Request, Response } from 'express';
import { OfferTemplateModel, CreateOfferTemplateData, CreateOfferTemplateItemData } from '../models/OfferTemplate';
import { logger } from '../utils/logger';

export const offerTemplateController = {
  // Get all templates
  getAll: async (req: Request, res: Response) => {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const templates = await OfferTemplateModel.findAll(activeOnly);
      res.json(templates);
    } catch (error: any) {
      logger.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  },

  // Get single template with items
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const template = await OfferTemplateModel.findById(parseInt(id));
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      const items = await OfferTemplateModel.getItems(parseInt(id));
      res.json({ ...template, items });
    } catch (error: any) {
      logger.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  },

  // Create template
  create: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data: CreateOfferTemplateData = {
        ...req.body,
        created_by: userId,
      };

      const template = await OfferTemplateModel.create(data);
      res.status(201).json(template);
    } catch (error: any) {
      logger.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  },

  // Update template
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const template = await OfferTemplateModel.update(parseInt(id), req.body);
      res.json(template);
    } catch (error: any) {
      logger.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  },

  // Delete template
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await OfferTemplateModel.delete(parseInt(id));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  },

  // Get template items
  getItems: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const items = await OfferTemplateModel.getItems(parseInt(id));
      res.json(items);
    } catch (error: any) {
      logger.error('Error fetching template items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  },

  // Add item to template
  addItem: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data: CreateOfferTemplateItemData = {
        ...req.body,
        template_id: parseInt(id),
      };
      const item = await OfferTemplateModel.addItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      logger.error('Error adding template item:', error);
      res.status(500).json({ error: 'Failed to add item' });
    }
  },

  // Update template item
  updateItem: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const item = await OfferTemplateModel.updateItem(parseInt(itemId), req.body);
      res.json(item);
    } catch (error: any) {
      logger.error('Error updating template item:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  },

  // Delete template item
  deleteItem: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      await OfferTemplateModel.deleteItem(parseInt(itemId));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting template item:', error);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  },

  // Create offer from template
  createOfferFromTemplate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { offerId } = req.body;
      await OfferTemplateModel.createOfferFromTemplate(parseInt(id), offerId);
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error creating offer from template:', error);
      res.status(500).json({ error: 'Failed to create offer from template' });
    }
  },
};






