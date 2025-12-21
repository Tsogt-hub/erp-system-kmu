import { Request, Response } from 'express';
import { ObjectAddressModel, CreateObjectAddressData, ADDRESS_TYPES } from '../models/ObjectAddress';
import { logger } from '../utils/logger';

export const objectAddressController = {
  // Get addresses by entity
  getByEntity: async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const addresses = await ObjectAddressModel.findByEntity(entityType, parseInt(entityId));
      res.json(addresses);
    } catch (error: any) {
      logger.error('Error fetching addresses:', error);
      res.status(500).json({ error: 'Failed to fetch addresses' });
    }
  },

  // Get default address
  getDefault: async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const { addressType } = req.query;
      const address = await ObjectAddressModel.findDefault(entityType, parseInt(entityId), addressType as string);
      res.json(address || null);
    } catch (error: any) {
      logger.error('Error fetching default address:', error);
      res.status(500).json({ error: 'Failed to fetch default address' });
    }
  },

  // Get single address
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const address = await ObjectAddressModel.findById(parseInt(id));
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.json(address);
    } catch (error: any) {
      logger.error('Error fetching address:', error);
      res.status(500).json({ error: 'Failed to fetch address' });
    }
  },

  // Create address
  create: async (req: Request, res: Response) => {
    try {
      const data: CreateObjectAddressData = req.body;
      const address = await ObjectAddressModel.create(data);
      res.status(201).json(address);
    } catch (error: any) {
      logger.error('Error creating address:', error);
      res.status(500).json({ error: 'Failed to create address' });
    }
  },

  // Update address
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const address = await ObjectAddressModel.update(parseInt(id), req.body);
      res.json(address);
    } catch (error: any) {
      logger.error('Error updating address:', error);
      res.status(500).json({ error: 'Failed to update address' });
    }
  },

  // Delete address
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await ObjectAddressModel.delete(parseInt(id));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting address:', error);
      res.status(500).json({ error: 'Failed to delete address' });
    }
  },

  // Get address types
  getTypes: async (_req: Request, res: Response) => {
    res.json(ADDRESS_TYPES);
  },
};









