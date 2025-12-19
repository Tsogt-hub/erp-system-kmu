import { Request, Response } from 'express';
import { DocumentModel, CreateDocumentData, DOCUMENT_TYPES, DOCUMENT_STATUSES } from '../models/Document';
import { logger } from '../utils/logger';

export const documentController = {
  // Get all documents of a specific type
  getByType: async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      if (!DOCUMENT_TYPES.includes(type)) {
        return res.status(400).json({ error: 'Invalid document type' });
      }
      const documents = await DocumentModel.findByType(type);
      res.json(documents);
    } catch (error: any) {
      logger.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  },

  // Get documents by project
  getByProject: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const documents = await DocumentModel.findByProject(parseInt(projectId));
      res.json(documents);
    } catch (error: any) {
      logger.error('Error fetching project documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  },

  // Get documents by customer
  getByCustomer: async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const documents = await DocumentModel.findByCustomer(parseInt(customerId));
      res.json(documents);
    } catch (error: any) {
      logger.error('Error fetching customer documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  },

  // Get single document
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const document = await DocumentModel.findById(parseInt(id));
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(document);
    } catch (error: any) {
      logger.error('Error fetching document:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  },

  // Create document
  create: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data: CreateDocumentData = {
        ...req.body,
        created_by: userId,
      };

      const document = await DocumentModel.create(data);
      res.status(201).json(document);
    } catch (error: any) {
      logger.error('Error creating document:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  },

  // Create from offer
  createFromOffer: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { offerId } = req.params;
      const { document_type } = req.body;

      if (!DOCUMENT_TYPES.includes(document_type)) {
        return res.status(400).json({ error: 'Invalid document type' });
      }

      const document = await DocumentModel.createFromOffer(parseInt(offerId), document_type, userId);
      res.status(201).json(document);
    } catch (error: any) {
      logger.error('Error creating document from offer:', error);
      res.status(500).json({ error: 'Failed to create document from offer' });
    }
  },

  // Update document
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const document = await DocumentModel.update(parseInt(id), req.body);
      res.json(document);
    } catch (error: any) {
      logger.error('Error updating document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  },

  // Update status
  updateStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!DOCUMENT_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const additionalData: { sent_at?: string; paid_at?: string } = {};
      if (status === 'sent') {
        additionalData.sent_at = new Date().toISOString();
      }
      if (status === 'paid') {
        additionalData.paid_at = new Date().toISOString();
      }

      const document = await DocumentModel.updateStatus(parseInt(id), status, additionalData);
      res.json(document);
    } catch (error: any) {
      logger.error('Error updating document status:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  },

  // Delete document
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await DocumentModel.delete(parseInt(id));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  },

  // Get document types
  getTypes: async (_req: Request, res: Response) => {
    res.json(DOCUMENT_TYPES);
  },

  // Get document statuses
  getStatuses: async (_req: Request, res: Response) => {
    res.json(DOCUMENT_STATUSES);
  },
};







