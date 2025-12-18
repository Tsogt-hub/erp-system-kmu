import { Request, Response } from 'express';
import { EntityFileModel, CreateEntityFileData, FILE_TYPES, FILE_CATEGORIES } from '../models/EntityFile';
import { logger } from '../utils/logger';

export const entityFileController = {
  // Get files by entity
  getByEntity: async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const { category } = req.query;
      const files = await EntityFileModel.findByEntity(entityType, parseInt(entityId), category as string);
      res.json(files);
    } catch (error: any) {
      logger.error('Error fetching entity files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  },

  // Get images only
  getImages: async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const files = await EntityFileModel.findImages(entityType, parseInt(entityId));
      res.json(files);
    } catch (error: any) {
      logger.error('Error fetching images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  },

  // Get documents only
  getDocuments: async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const files = await EntityFileModel.findDocuments(entityType, parseInt(entityId));
      res.json(files);
    } catch (error: any) {
      logger.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  },

  // Get single file
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = await EntityFileModel.findById(parseInt(id));
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.json(file);
    } catch (error: any) {
      logger.error('Error fetching file:', error);
      res.status(500).json({ error: 'Failed to fetch file' });
    }
  },

  // Create file record (actual file upload handled separately)
  create: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data: CreateEntityFileData = {
        ...req.body,
        uploaded_by: userId,
      };

      const file = await EntityFileModel.create(data);
      res.status(201).json(file);
    } catch (error: any) {
      logger.error('Error creating file record:', error);
      res.status(500).json({ error: 'Failed to create file record' });
    }
  },

  // Update file metadata
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = await EntityFileModel.update(parseInt(id), req.body);
      res.json(file);
    } catch (error: any) {
      logger.error('Error updating file:', error);
      res.status(500).json({ error: 'Failed to update file' });
    }
  },

  // Delete file
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await EntityFileModel.delete(parseInt(id));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  },

  // Get file counts
  getCounts: async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const counts = await EntityFileModel.countByEntity(entityType, parseInt(entityId));
      res.json(counts);
    } catch (error: any) {
      logger.error('Error fetching file counts:', error);
      res.status(500).json({ error: 'Failed to fetch counts' });
    }
  },

  // Get file types and categories
  getOptions: async (_req: Request, res: Response) => {
    res.json({
      fileTypes: FILE_TYPES,
      fileCategories: FILE_CATEGORIES,
    });
  },
};





