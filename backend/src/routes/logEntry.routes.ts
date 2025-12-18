import { Router } from 'express';
import {
  createLogEntry,
  getLogEntriesByEntity,
  getAllLogEntries,
  getLogEntryById,
  deleteLogEntry,
  getLogActionLabels,
  getLogEntryCount,
} from '../controllers/logEntry.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Alle Routen erfordern Authentifizierung
router.use(authMiddleware);

// Log-Eintrag erstellen
router.post('/', createLogEntry);

// Alle Log-Einträge abrufen (mit Filteroptionen)
router.get('/', getAllLogEntries);

// Action Labels abrufen
router.get('/actions', getLogActionLabels);

// Anzahl der Log-Einträge
router.get('/count', getLogEntryCount);

// Log-Einträge für eine bestimmte Entität abrufen
router.get('/entity/:entityType/:entityId', getLogEntriesByEntity);

// Einzelnen Log-Eintrag abrufen
router.get('/:id', getLogEntryById);

// Log-Eintrag löschen
router.delete('/:id', deleteLogEntry);

export default router;

