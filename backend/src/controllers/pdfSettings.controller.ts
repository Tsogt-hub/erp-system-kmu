import { Request, Response } from 'express';
import { pdfSettingsService } from '../services/pdfSettings.service';
import { pdfService } from '../services/pdf.service';
import { logger } from '../utils/logger';

export class PDFSettingsController {
  /**
   * GET /api/pdf-settings
   * Alle PDF-Einstellungen laden
   */
  static getAll(req: Request, res: Response) {
    try {
      const settings = pdfSettingsService.getAll();
      res.json(settings);
    } catch (error: any) {
      logger.error('Fehler beim Laden der PDF-Einstellungen:', error);
      res.status(500).json({ error: 'Fehler beim Laden der PDF-Einstellungen' });
    }
  }

  /**
   * GET /api/pdf-settings/:documentType
   * Einstellungen für einen Dokumententyp laden
   */
  static getByDocumentType(req: Request, res: Response) {
    try {
      const { documentType } = req.params;
      const settings = pdfSettingsService.getByDocumentType(documentType);
      res.json(settings);
    } catch (error: any) {
      logger.error('Fehler beim Laden der PDF-Einstellungen:', error);
      res.status(500).json({ error: 'Fehler beim Laden der PDF-Einstellungen' });
    }
  }

  /**
   * PUT /api/pdf-settings/:documentType
   * Einstellungen für einen Dokumententyp aktualisieren
   */
  static update(req: Request, res: Response) {
    try {
      const { documentType } = req.params;
      const data = req.body;
      
      const settings = pdfSettingsService.update(documentType, data);
      res.json(settings);
    } catch (error: any) {
      logger.error('Fehler beim Aktualisieren der PDF-Einstellungen:', error);
      res.status(500).json({ error: 'Fehler beim Aktualisieren der PDF-Einstellungen' });
    }
  }

  /**
   * POST /api/pdf-settings/upload/logo
   * Logo hochladen
   */
  static async uploadLogo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen' });
      }

      const documentType = req.body.documentType || 'default';
      const logoUrl = await pdfSettingsService.saveLogo(req.file, documentType);
      
      res.json({ 
        success: true, 
        logoUrl,
        message: 'Logo erfolgreich hochgeladen' 
      });
    } catch (error: any) {
      logger.error('Fehler beim Hochladen des Logos:', error);
      res.status(500).json({ error: 'Fehler beim Hochladen des Logos' });
    }
  }

  /**
   * POST /api/pdf-settings/upload/letterhead
   * Briefpapier-PDF hochladen
   */
  static async uploadLetterhead(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen' });
      }

      const documentType = req.body.documentType || 'default';
      const letterheadUrl = await pdfSettingsService.saveLetterhead(req.file, documentType);
      
      res.json({ 
        success: true, 
        letterheadUrl,
        message: 'Briefpapier erfolgreich hochgeladen' 
      });
    } catch (error: any) {
      logger.error('Fehler beim Hochladen des Briefpapiers:', error);
      res.status(500).json({ error: 'Fehler beim Hochladen des Briefpapiers' });
    }
  }

  /**
   * DELETE /api/pdf-settings/:documentType/logo
   * Logo löschen
   */
  static deleteLogo(req: Request, res: Response) {
    try {
      const { documentType } = req.params;
      pdfSettingsService.deleteLogo(documentType);
      res.json({ success: true, message: 'Logo gelöscht' });
    } catch (error: any) {
      logger.error('Fehler beim Löschen des Logos:', error);
      res.status(500).json({ error: 'Fehler beim Löschen des Logos' });
    }
  }

  /**
   * DELETE /api/pdf-settings/:documentType/letterhead
   * Briefpapier löschen
   */
  static deleteLetterhead(req: Request, res: Response) {
    try {
      const { documentType } = req.params;
      pdfSettingsService.deleteLetterhead(documentType);
      res.json({ success: true, message: 'Briefpapier gelöscht' });
    } catch (error: any) {
      logger.error('Fehler beim Löschen des Briefpapiers:', error);
      res.status(500).json({ error: 'Fehler beim Löschen des Briefpapiers' });
    }
  }

  /**
   * GET /api/pdf-settings/preview/:documentType
   * Vorschau-PDF generieren
   */
  static async getPreview(req: Request, res: Response) {
    try {
      const { documentType } = req.params;
      const settings = pdfSettingsService.getByDocumentType(documentType);
      
      // Beispieldaten für die Vorschau
      const previewData = {
        offer_number: 'VORSCHAU-001',
        date: new Date().toLocaleDateString('de-DE'),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
        customer: {
          name: 'Max Mustermann',
          address: 'Musterstraße 17a',
          postal_code: '12345',
          city: 'Musterstadt',
        },
        project: {
          name: 'Musterstraße 17a',
          address: 'Musterstraße 17a, 12345 Musterstadt',
        },
        items: [
          {
            position: 1,
            description: 'PV-Modul Trina Solar 400W',
            quantity: 10,
            unit: 'Stk',
            unit_price: 210.00,
            total: 2100.00,
          },
          {
            position: 2,
            description: 'Wechselrichter SMA Sunny Tripower 10.0',
            quantity: 1,
            unit: 'Stk',
            unit_price: 1850.00,
            total: 1850.00,
          },
          {
            position: 3,
            description: 'Montagesystem für Schrägdach',
            quantity: 1,
            unit: 'Set',
            unit_price: 450.00,
            total: 450.00,
          },
        ],
        intro_text: settings.intro_text_template || 'Vielen Dank für Ihr Interesse. Gerne unterbreiten wir Ihnen folgendes Angebot:',
        payment_terms: settings.footer_text_template || 'Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt ohne Abzug.',
        total_net: 4400.00,
        total_tax: 836.00,
        tax_rate: 19,
        total_gross: 5236.00,
        is_draft: true,
        company: {
          name: 'Elite PV GmbH',
          address: 'Lindenhof 4b, 92670 Windischeschenbach',
          street: 'Lindenhof 4b',
          postal_code: '92670',
          city: 'Windischeschenbach',
          phone: '09681 9184308',
          email: 'info@elite-pv.de',
          website: 'www.elite-pv.de',
          tax_number: '255/125/51087',
          bank_name: 'Volksbank Raiffeisenbank Nordoberpfalz',
          iban: 'DE54 7539 0000 0000 7712 87',
          bic: 'GENODEF1WEV',
        },
        branding: {
          primaryColor: settings.primary_color,
          secondaryColor: settings.secondary_color,
          fontFamily: settings.font_family,
        },
      };

      const pdfBuffer = await pdfService.generateOffer(previewData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=vorschau.pdf');
      res.send(pdfBuffer);
    } catch (error: any) {
      logger.error('Fehler beim Generieren der Vorschau:', error);
      res.status(500).json({ error: 'Fehler beim Generieren der Vorschau' });
    }
  }

  /**
   * POST /api/pdf-settings/:documentType/copy
   * Einstellungen von einem Typ zu einem anderen kopieren
   */
  static copySettings(req: Request, res: Response) {
    try {
      const { documentType } = req.params;
      const { fromType } = req.body;
      
      if (!fromType) {
        return res.status(400).json({ error: 'fromType ist erforderlich' });
      }

      const settings = pdfSettingsService.copySettings(fromType, documentType);
      res.json(settings);
    } catch (error: any) {
      logger.error('Fehler beim Kopieren der Einstellungen:', error);
      res.status(500).json({ error: 'Fehler beim Kopieren der Einstellungen' });
    }
  }
}

