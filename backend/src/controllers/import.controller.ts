import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ImportService } from '../services/import.service';
import multer from 'multer';
import { logger } from '../utils/logger';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Nur CSV-Dateien sind erlaubt'));
    }
  },
});

export class ImportController {
  static upload = upload.single('file');

  static async importItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen' });
      }

      // Convert buffer to string
      const csvContent = req.file.buffer.toString('utf-8');

      // Import items
      const result = await ImportService.importItemsFromCSV(csvContent);

      logger.info(`📊 Import abgeschlossen: ${result.success} erfolgreich von ${result.total} Zeilen`);

      res.json({
        message: 'Import abgeschlossen',
        result,
      });
    } catch (error: any) {
      logger.error('❌ Import-Fehler:', error.message);
      next(error);
    }
  }
}





