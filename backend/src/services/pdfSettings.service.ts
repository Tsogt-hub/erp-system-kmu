import { PDFSettingsModel, PDFSettings, CreatePDFSettingsData, DEFAULT_PDF_SETTINGS } from '../models/PDFSettings';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

class PDFSettingsService {
  /**
   * Hole PDF-Einstellungen für einen Dokumententyp
   */
  getByDocumentType(documentType: string): PDFSettings {
    try {
      return PDFSettingsModel.getOrCreateDefault(documentType);
    } catch (error) {
      logger.error('Fehler beim Laden der PDF-Einstellungen:', error);
      // Fallback zu Standardwerten
      return {
        id: 0,
        ...DEFAULT_PDF_SETTINGS,
        document_type: documentType,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
  }

  /**
   * Hole alle PDF-Einstellungen
   */
  getAll(): PDFSettings[] {
    try {
      const settings = PDFSettingsModel.findAll();
      
      // Falls keine Einstellungen existieren, erstelle Default
      if (settings.length === 0) {
        const defaultSettings = PDFSettingsModel.create({ document_type: 'default' });
        return [defaultSettings];
      }
      
      return settings;
    } catch (error) {
      logger.error('Fehler beim Laden aller PDF-Einstellungen:', error);
      return [];
    }
  }

  /**
   * Aktualisiere PDF-Einstellungen für einen Dokumententyp
   */
  update(documentType: string, data: Partial<CreatePDFSettingsData>): PDFSettings {
    try {
      logger.info(`PDF-Einstellungen aktualisieren für: ${documentType}`, data);
      return PDFSettingsModel.update(documentType, data);
    } catch (error) {
      logger.error('Fehler beim Aktualisieren der PDF-Einstellungen:', error);
      throw error;
    }
  }

  /**
   * Speichere hochgeladenes Logo
   */
  async saveLogo(file: Express.Multer.File, documentType: string): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', 'branding');
      
      // Erstelle Verzeichnis falls nicht vorhanden
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `logo-${documentType}-${Date.now()}${path.extname(file.originalname)}`;
      const filepath = path.join(uploadDir, filename);
      
      // Speichere Datei
      fs.writeFileSync(filepath, file.buffer);
      
      const logoUrl = `/uploads/branding/${filename}`;
      
      // Aktualisiere Einstellungen
      this.update(documentType, { logo_url: logoUrl });
      
      logger.info(`Logo gespeichert: ${logoUrl}`);
      return logoUrl;
    } catch (error) {
      logger.error('Fehler beim Speichern des Logos:', error);
      throw error;
    }
  }

  /**
   * Speichere hochgeladenes Briefpapier-PDF
   */
  async saveLetterhead(file: Express.Multer.File, documentType: string): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', 'branding');
      
      // Erstelle Verzeichnis falls nicht vorhanden
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `letterhead-${documentType}-${Date.now()}.pdf`;
      const filepath = path.join(uploadDir, filename);
      
      // Speichere Datei
      fs.writeFileSync(filepath, file.buffer);
      
      const letterheadUrl = `/uploads/branding/${filename}`;
      
      // Aktualisiere Einstellungen
      this.update(documentType, { letterhead_url: letterheadUrl });
      
      logger.info(`Briefpapier gespeichert: ${letterheadUrl}`);
      return letterheadUrl;
    } catch (error) {
      logger.error('Fehler beim Speichern des Briefpapiers:', error);
      throw error;
    }
  }

  /**
   * Lösche eine Datei
   */
  deleteFile(fileUrl: string): void {
    try {
      const filepath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        logger.info(`Datei gelöscht: ${fileUrl}`);
      }
    } catch (error) {
      logger.error('Fehler beim Löschen der Datei:', error);
    }
  }

  /**
   * Lösche Logo für Dokumententyp
   */
  deleteLogo(documentType: string): void {
    const settings = this.getByDocumentType(documentType);
    if (settings.logo_url) {
      this.deleteFile(settings.logo_url);
      this.update(documentType, { logo_url: undefined });
    }
  }

  /**
   * Lösche Briefpapier für Dokumententyp
   */
  deleteLetterhead(documentType: string): void {
    const settings = this.getByDocumentType(documentType);
    if (settings.letterhead_url) {
      this.deleteFile(settings.letterhead_url);
      this.update(documentType, { letterhead_url: undefined });
    }
  }

  /**
   * Kopiere Einstellungen von einem Dokumententyp zu einem anderen
   */
  copySettings(fromType: string, toType: string): PDFSettings {
    const sourceSettings = this.getByDocumentType(fromType);
    const { id, created_at, updated_at, document_type, ...settingsData } = sourceSettings;
    
    return PDFSettingsModel.update(toType, settingsData);
  }
}

export const pdfSettingsService = new PDFSettingsService();
