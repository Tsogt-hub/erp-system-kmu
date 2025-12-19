import { Router } from 'express';
import multer from 'multer';
import { PDFSettingsController } from '../controllers/pdfSettings.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Multer-Konfiguration für Datei-Uploads
const storage = multer.memoryStorage();

const logoUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max für Logos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bilder (PNG, JPG, GIF, SVG) sind erlaubt'));
    }
  },
});

const letterheadUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max für PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Nur PDF-Dateien sind erlaubt'));
    }
  },
});

// Alle Routen erfordern Authentifizierung
router.use(authMiddleware);

// GET /api/pdf-settings - Alle Einstellungen laden
router.get('/', PDFSettingsController.getAll);

// GET /api/pdf-settings/preview/:documentType - Vorschau generieren
router.get('/preview/:documentType', PDFSettingsController.getPreview);

// GET /api/pdf-settings/:documentType - Einstellungen für Dokumententyp
router.get('/:documentType', PDFSettingsController.getByDocumentType);

// PUT /api/pdf-settings/:documentType - Einstellungen aktualisieren
router.put('/:documentType', PDFSettingsController.update);

// POST /api/pdf-settings/upload/logo - Logo hochladen
router.post('/upload/logo', logoUpload.single('file'), PDFSettingsController.uploadLogo);

// POST /api/pdf-settings/upload/letterhead - Briefpapier hochladen
router.post('/upload/letterhead', letterheadUpload.single('file'), PDFSettingsController.uploadLetterhead);

// DELETE /api/pdf-settings/:documentType/logo - Logo löschen
router.delete('/:documentType/logo', PDFSettingsController.deleteLogo);

// DELETE /api/pdf-settings/:documentType/letterhead - Briefpapier löschen
router.delete('/:documentType/letterhead', PDFSettingsController.deleteLetterhead);

// POST /api/pdf-settings/:documentType/copy - Einstellungen kopieren
router.post('/:documentType/copy', PDFSettingsController.copySettings);

export default router;
