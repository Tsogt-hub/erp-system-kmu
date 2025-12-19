import { Request, Response } from 'express';
import { OpenItemModel, CreateOpenItemData, CreatePaymentData, PAYMENT_STATUSES } from '../models/OpenItem';
import { logger } from '../utils/logger';

export const openItemController = {
  // Get all open items
  getAll: async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const items = await OpenItemModel.findAll(status as string);
      res.json(items);
    } catch (error: any) {
      logger.error('Error fetching open items:', error);
      res.status(500).json({ error: 'Failed to fetch open items' });
    }
  },

  // Get open items only
  getOpen: async (_req: Request, res: Response) => {
    try {
      const items = await OpenItemModel.findOpen();
      res.json(items);
    } catch (error: any) {
      logger.error('Error fetching open items:', error);
      res.status(500).json({ error: 'Failed to fetch open items' });
    }
  },

  // Get overdue items
  getOverdue: async (_req: Request, res: Response) => {
    try {
      const items = await OpenItemModel.findOverdue();
      res.json(items);
    } catch (error: any) {
      logger.error('Error fetching overdue items:', error);
      res.status(500).json({ error: 'Failed to fetch overdue items' });
    }
  },

  // Get by customer
  getByCustomer: async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const items = await OpenItemModel.findByCustomer(parseInt(customerId));
      res.json(items);
    } catch (error: any) {
      logger.error('Error fetching customer open items:', error);
      res.status(500).json({ error: 'Failed to fetch open items' });
    }
  },

  // Get single item
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await OpenItemModel.findById(parseInt(id));
      if (!item) {
        return res.status(404).json({ error: 'Open item not found' });
      }
      const payments = await OpenItemModel.getPayments(parseInt(id));
      res.json({ ...item, payments });
    } catch (error: any) {
      logger.error('Error fetching open item:', error);
      res.status(500).json({ error: 'Failed to fetch open item' });
    }
  },

  // Create open item
  create: async (req: Request, res: Response) => {
    try {
      const data: CreateOpenItemData = req.body;
      const item = await OpenItemModel.create(data);
      res.status(201).json(item);
    } catch (error: any) {
      logger.error('Error creating open item:', error);
      res.status(500).json({ error: 'Failed to create open item' });
    }
  },

  // Update open item
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await OpenItemModel.update(parseInt(id), req.body);
      res.json(item);
    } catch (error: any) {
      logger.error('Error updating open item:', error);
      res.status(500).json({ error: 'Failed to update open item' });
    }
  },

  // Delete open item
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await OpenItemModel.delete(parseInt(id));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting open item:', error);
      res.status(500).json({ error: 'Failed to delete open item' });
    }
  },

  // Add payment
  addPayment: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const data: CreatePaymentData = {
        ...req.body,
        open_item_id: parseInt(id),
        created_by: userId,
      };
      const payment = await OpenItemModel.addPayment(data);
      res.status(201).json(payment);
    } catch (error: any) {
      logger.error('Error adding payment:', error);
      res.status(500).json({ error: 'Failed to add payment' });
    }
  },

  // Get payments
  getPayments: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const payments = await OpenItemModel.getPayments(parseInt(id));
      res.json(payments);
    } catch (error: any) {
      logger.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  },

  // Delete payment
  deletePayment: async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      await OpenItemModel.deletePayment(parseInt(paymentId));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting payment:', error);
      res.status(500).json({ error: 'Failed to delete payment' });
    }
  },

  // Increment dunning level
  incrementDunning: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await OpenItemModel.incrementDunningLevel(parseInt(id));
      res.json(item);
    } catch (error: any) {
      logger.error('Error incrementing dunning level:', error);
      res.status(500).json({ error: 'Failed to increment dunning level' });
    }
  },

  // Get statistics
  getStatistics: async (_req: Request, res: Response) => {
    try {
      const stats = await OpenItemModel.getStatistics();
      res.json(stats);
    } catch (error: any) {
      logger.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  },

  // Get statuses
  getStatuses: async (_req: Request, res: Response) => {
    res.json(PAYMENT_STATUSES);
  },
};






