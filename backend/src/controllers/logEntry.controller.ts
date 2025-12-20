import { Request, Response } from 'express';
import { LogEntryModel, CreateLogEntryData, LOG_ACTION_LABELS } from '../models/LogEntry';
import { logger } from '../utils/logger';

export const createLogEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateLogEntryData = {
      entity_type: req.body.entity_type,
      entity_id: req.body.entity_id,
      action: req.body.action,
      description: req.body.description,
      user_id: req.body.user_id || (req as any).user?.id,
      metadata: req.body.metadata,
    };

    if (!data.entity_type || !data.entity_id || !data.action || !data.description) {
      res.status(400).json({ error: 'Pflichtfelder fehlen: entity_type, entity_id, action, description' });
      return;
    }

    if (!data.user_id) {
      res.status(400).json({ error: 'user_id ist erforderlich' });
      return;
    }

    const entry = await LogEntryModel.create(data);
    res.status(201).json(entry);
  } catch (error: any) {
    logger.error('Fehler beim Erstellen des Log-Eintrags:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

export const getLogEntriesByEntity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const { limit, offset, action } = req.query;

    if (!entityType || !entityId) {
      res.status(400).json({ error: 'entityType und entityId sind erforderlich' });
      return;
    }

    const entries = await LogEntryModel.findByEntity(entityType, parseInt(entityId), {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      action: action as string,
    });

    res.json(entries);
  } catch (error: any) {
    logger.error('Fehler beim Abrufen der Log-Einträge:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

export const getAllLogEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit, offset, user_id, entity_type } = req.query;

    const entries = await LogEntryModel.findAll({
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : undefined,
      user_id: user_id ? parseInt(user_id as string) : undefined,
      entity_type: entity_type as string,
    });

    res.json(entries);
  } catch (error: any) {
    logger.error('Fehler beim Abrufen aller Log-Einträge:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

export const getLogEntryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const entry = await LogEntryModel.findById(parseInt(id));

    if (!entry) {
      res.status(404).json({ error: 'Log-Eintrag nicht gefunden' });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    logger.error('Fehler beim Abrufen des Log-Eintrags:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

export const deleteLogEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await LogEntryModel.delete(parseInt(id));

    if (!deleted) {
      res.status(404).json({ error: 'Log-Eintrag nicht gefunden' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    logger.error('Fehler beim Löschen des Log-Eintrags:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

export const getLogActionLabels = async (_req: Request, res: Response): Promise<void> => {
  res.json(LOG_ACTION_LABELS);
};

export const getLogEntryCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.query;

    const count = await LogEntryModel.count(
      entityType as string,
      entityId ? parseInt(entityId as string) : undefined
    );

    res.json({ count });
  } catch (error: any) {
    logger.error('Fehler beim Zählen der Log-Einträge:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};








