// PDF-Service für Dokumentengenerierung
// Verwendet PDFKit (pure Node.js, keine Browser-Abhängigkeit)

import PDFDocument from 'pdfkit';
import { logger } from '../utils/logger';
import { PDFSettingsModel, PDFSettings, DEFAULT_PDF_SETTINGS } from '../models/PDFSettings';
import fs from 'fs';
import path from 'path';

export interface PDFOptions {
  format?: 'A4' | 'A5' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

// Anpassbare Firmenfarben (können über Einstellungen geändert werden)
export interface PDFBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily: string;
}

export const DEFAULT_BRANDING: PDFBranding = {
  primaryColor: '#1976D2', // Elite PV Blau
  secondaryColor: '#FF9800', // Akzentfarbe
  fontFamily: 'Helvetica',
};

// Hilfsfunktion: Hex-Farbe zu RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

// Währungsformatierung
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// Datum formatieren
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

class PDFService {
  // Lade PDF-Einstellungen aus der Datenbank
  private getSettings(documentType: string = 'offer'): PDFSettings {
    try {
      const settings = PDFSettingsModel.findByDocumentType(documentType);
      if (settings) return settings;
      
      // Fallback zu default
      const defaultSettings = PDFSettingsModel.findByDocumentType('default');
      if (defaultSettings) return defaultSettings;
      
      // Fallback zu Hardcoded-Werten
      return {
        id: 0,
        ...DEFAULT_PDF_SETTINGS,
        document_type: documentType,
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (error) {
      logger.warn('PDF-Einstellungen konnten nicht geladen werden, verwende Standardwerte');
      return {
        id: 0,
        ...DEFAULT_PDF_SETTINGS,
        document_type: documentType,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
  }

  // PDF aus Daten generieren (Angebot)
  async generateOffer(offer: {
    offer_number: string;
    date: string;
    valid_until: string;
    customer: {
      name: string;
      address: string;
      postal_code: string;
      city: string;
    };
    project?: {
      name: string;
      address: string;
    };
    items: Array<{
      position: number;
      description: string;
      long_description?: string;
      quantity: number;
      unit: string;
      unit_price: number;
      total: number;
      item_type?: string;
      image_url?: string;
    }>;
    intro_text?: string;
    footer_text?: string;
    payment_terms?: string;
    total_net: number;
    total_tax: number;
    tax_rate: number;
    total_gross: number;
    is_draft?: boolean;
    company: {
      name: string;
      address: string;
      street?: string;
      postal_code?: string;
      city?: string;
      phone: string;
      email: string;
      website: string;
      tax_number: string;
      bank_name: string;
      iban: string;
      bic: string;
      logo_url?: string;
    };
    branding?: PDFBranding;
  }): Promise<Buffer> {
    logger.info('PDF wird mit PDFKit generiert', { offer_number: offer.offer_number });

    // Lade Einstellungen aus Datenbank
    const settings = this.getSettings('offer');
    
    // Verwende Branding aus Parametern oder aus Einstellungen
    const branding = offer.branding || {
      primaryColor: settings.primary_color,
      secondaryColor: settings.secondary_color,
      fontFamily: settings.font_family,
    };
    const primaryRgb = hexToRgb(branding.primaryColor);
    const secondaryRgb = hexToRgb(branding.secondaryColor);

    return new Promise((resolve, reject) => {
      try {
        // PDF-Dokument erstellen mit Einstellungen aus DB
        const doc = new PDFDocument({
          size: 'A4',
          margins: { 
            top: settings.margin_top, 
            bottom: settings.margin_bottom, 
            left: settings.margin_left, 
            right: settings.margin_right 
          },
          info: {
            Title: `Angebot ${offer.offer_number}`,
            Author: offer.company.name,
            Subject: 'Angebot',
            Keywords: 'Angebot, Kostenvoranschlag',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        const pageWidth = 595.28; // A4 width in points
        const leftMargin = settings.margin_left;
        const rightMargin = pageWidth - settings.margin_right;
        const contentWidth = pageWidth - settings.margin_left - settings.margin_right;
        const fontSize = settings.font_size;

        // Logo aus Einstellungen laden (falls vorhanden)
        if (settings.logo_url) {
          try {
            const logoPath = path.join(process.cwd(), settings.logo_url);
            if (fs.existsSync(logoPath)) {
              doc.image(logoPath, settings.logo_position_x, settings.logo_position_y, { 
                width: settings.logo_width 
              });
            }
          } catch (logoError) {
            logger.warn('Logo konnte nicht geladen werden:', logoError);
          }
        }

        // ==================== HEADER ====================
        // Firmenname/Logo links
        doc.fontSize(20)
           .fillColor(primaryRgb)
           .font('Helvetica-Bold')
           .text(offer.company.name, leftMargin, 40, { width: 250 });

        // Firmeninfo rechts
        const companyInfoX = 350;
        doc.fontSize(8)
           .fillColor('#555555')
           .font('Helvetica')
           .text(offer.company.street || offer.company.address, companyInfoX, 40, { align: 'right', width: 195 })
           .text(`${offer.company.postal_code || ''} ${offer.company.city || ''}`, { align: 'right', width: 195 })
           .text(`Tel: ${offer.company.phone}`, { align: 'right', width: 195 })
           .text(`E-Mail: ${offer.company.email}`, { align: 'right', width: 195 })
           .text(offer.company.website, { align: 'right', width: 195 });

        // Trennlinie unter Header
        doc.moveTo(leftMargin, 95)
           .lineTo(rightMargin, 95)
           .strokeColor(primaryRgb)
           .lineWidth(2)
           .stroke();

        // ==================== ABSENDER-ZEILE ====================
        const companyFullAddress = offer.company.street
          ? `${offer.company.name} · ${offer.company.street}, ${offer.company.postal_code} ${offer.company.city}`
          : `${offer.company.name} · ${offer.company.address}`;

        doc.fontSize(7)
           .fillColor('#888888')
           .font('Helvetica')
           .text(companyFullAddress, leftMargin, 115);

        // Linie unter Absender
        doc.moveTo(leftMargin, 125)
           .lineTo(leftMargin + 200, 125)
           .strokeColor('#888888')
           .lineWidth(0.5)
           .stroke();

        // ==================== EMPFÄNGER-ADRESSE ====================
        doc.fontSize(11)
           .fillColor('#000000')
           .font('Helvetica-Bold')
           .text(offer.customer.name, leftMargin, 135);

        doc.fontSize(10)
           .font('Helvetica')
           .text(offer.customer.address || '', leftMargin, 150)
           .text(`${offer.customer.postal_code || ''} ${offer.customer.city || ''}`, leftMargin, 163);

        // ==================== DOKUMENT-INFO-BOX ====================
        const infoBoxX = 370;
        const infoBoxY = 115;
        const infoBoxWidth = 175;
        const infoBoxHeight = 80;

        // Box-Hintergrund
        doc.rect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight)
           .fillColor('#f8f9fa')
           .fill();

        // Linker Akzentstreifen
        doc.rect(infoBoxX, infoBoxY, 4, infoBoxHeight)
           .fillColor(primaryRgb)
           .fill();

        // Box-Inhalt
        const infoTextX = infoBoxX + 12;
        let infoTextY = infoBoxY + 10;

        doc.fontSize(8)
           .fillColor('#666666')
           .font('Helvetica')
           .text('Angebot Nr.:', infoTextX, infoTextY);
        doc.font('Helvetica-Bold')
           .fillColor('#000000')
           .text(offer.offer_number, infoTextX + 80, infoTextY);

        infoTextY += 15;
        doc.font('Helvetica')
           .fillColor('#666666')
           .text('Datum:', infoTextX, infoTextY);
        doc.font('Helvetica-Bold')
           .fillColor('#000000')
           .text(offer.date, infoTextX + 80, infoTextY);

        infoTextY += 15;
        doc.font('Helvetica')
           .fillColor('#666666')
           .text('Gültig bis:', infoTextX, infoTextY);
        doc.font('Helvetica-Bold')
           .fillColor('#000000')
           .text(offer.valid_until, infoTextX + 80, infoTextY);

        if (offer.project) {
          infoTextY += 15;
          doc.font('Helvetica')
             .fillColor('#666666')
             .text('Projekt:', infoTextX, infoTextY);
          doc.font('Helvetica-Bold')
             .fillColor('#000000')
             .text(offer.project.name, infoTextX + 80, infoTextY, { width: 80 });
        }

        // ==================== WASSERZEICHEN (Entwurf) ====================
        if (offer.is_draft) {
          doc.save();
          doc.rotate(-45, { origin: [pageWidth / 2, 400] });
          doc.fontSize(80)
             .fillColor('#c8c8c8')
             .opacity(0.3)
             .text('ENTWURF', 100, 350, { align: 'center', width: 400 });
          doc.restore();
          doc.opacity(1);
        }

        // ==================== TITEL ====================
        let currentY = 210;

        doc.fontSize(16)
           .fillColor(primaryRgb)
           .font('Helvetica-Bold')
           .text(`Angebot ${offer.offer_number}`, leftMargin, currentY);

        // Linie unter Titel
        currentY += 25;
        doc.moveTo(leftMargin, currentY)
           .lineTo(rightMargin, currentY)
           .strokeColor('#eeeeee')
           .lineWidth(1)
           .stroke();

        // ==================== EINLEITUNGSTEXT ====================
        currentY += 15;
        if (offer.intro_text) {
          doc.fontSize(9)
             .fillColor('#444444')
             .font('Helvetica')
             .text(offer.intro_text, leftMargin, currentY, { width: contentWidth, lineGap: 3 });
          currentY = doc.y + 15;
        }

        // ==================== POSITIONEN-TABELLE ====================
        // Tabellen-Header
        const colWidths = {
          pos: 35,
          description: 200,
          qty: 45,
          unit: 40,
          price: 75,
          total: 80,
        };

        // Header-Zeile Hintergrund
        doc.rect(leftMargin, currentY, contentWidth, 22)
           .fillColor(primaryRgb)
           .fill();

        // Header-Text
        doc.fontSize(8)
           .fillColor('#ffffff')
           .font('Helvetica-Bold');

        let colX = leftMargin + 5;
        doc.text('Pos.', colX, currentY + 7);
        colX += colWidths.pos;
        doc.text('Bezeichnung', colX, currentY + 7);
        colX += colWidths.description;
        doc.text('Menge', colX, currentY + 7, { width: colWidths.qty, align: 'center' });
        colX += colWidths.qty;
        doc.text('Einheit', colX, currentY + 7, { width: colWidths.unit, align: 'center' });
        colX += colWidths.unit;
        doc.text('Einzelpreis', colX, currentY + 7, { width: colWidths.price, align: 'right' });
        colX += colWidths.price;
        doc.text('Gesamt', colX, currentY + 7, { width: colWidths.total, align: 'right' });

        currentY += 22;

        // Positionen
        for (const item of offer.items) {
          const isOptional = item.item_type === 'optional';
          const isAlternative = item.item_type === 'alternative';
          const isExcluded = isOptional || isAlternative;

          // Zeilen-Hintergrund für optionale/alternative Positionen
          if (isOptional) {
            doc.rect(leftMargin, currentY, contentWidth, 30)
               .fillColor('#fff3e0')
               .fill();
          } else if (isAlternative) {
            doc.rect(leftMargin, currentY, contentWidth, 30)
               .fillColor('#e3f2fd')
               .fill();
          }

          // Position Nummer
          colX = leftMargin + 5;
          doc.fontSize(9)
             .fillColor(isOptional ? '#e65100' : isAlternative ? '#1565c0' : primaryRgb)
             .font('Helvetica-Bold')
             .text(item.position.toString().padStart(3, '0'), colX, currentY + 8);

          // Bezeichnung
          colX += colWidths.pos;
          let descText = item.description;
          if (isOptional) descText = '[Bedarfspos.] ' + descText;
          if (isAlternative) descText = '[Alternative] ' + descText;

          doc.fontSize(9)
             .fillColor(isOptional ? '#e65100' : isAlternative ? '#1565c0' : '#333333')
             .font(isExcluded ? 'Helvetica-Oblique' : 'Helvetica-Bold')
             .text(descText, colX, currentY + 8, { width: colWidths.description - 5 });

          // Menge
          colX += colWidths.description;
          doc.font('Helvetica')
             .fillColor('#333333')
             .text(item.quantity.toString(), colX, currentY + 8, { width: colWidths.qty, align: 'center' });

          // Einheit
          colX += colWidths.qty;
          doc.text(item.unit, colX, currentY + 8, { width: colWidths.unit, align: 'center' });

          // Einzelpreis
          colX += colWidths.unit;
          doc.text(formatCurrency(item.unit_price), colX, currentY + 8, { width: colWidths.price, align: 'right' });

          // Gesamt
          colX += colWidths.price;
          const totalText = isExcluded ? `(${formatCurrency(item.total)})` : formatCurrency(item.total);
          doc.font('Helvetica-Bold')
             .text(totalText, colX, currentY + 8, { width: colWidths.total, align: 'right' });

          // Trennlinie
          currentY += 30;
          doc.moveTo(leftMargin, currentY)
             .lineTo(rightMargin, currentY)
             .strokeColor('#e9ecef')
             .lineWidth(0.5)
             .stroke();

          // Seitenumbruch prüfen
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
        }

        // ==================== SUMMEN-BLOCK ====================
        currentY += 20;
        const summaryX = rightMargin - 200;
        const summaryWidth = 200;

        // Nettobetrag
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Nettobetrag:', summaryX, currentY, { width: 100 });
        doc.font('Helvetica-Bold')
           .fillColor('#000000')
           .text(formatCurrency(offer.total_net), summaryX + 100, currentY, { width: 100, align: 'right' });

        // MwSt
        currentY += 18;
        doc.moveTo(summaryX, currentY - 3)
           .lineTo(summaryX + summaryWidth, currentY - 3)
           .strokeColor('#dddddd')
           .lineWidth(0.5)
           .stroke();

        doc.font('Helvetica')
           .fillColor('#666666')
           .text(`zzgl. ${offer.tax_rate}% MwSt.:`, summaryX, currentY, { width: 100 });
        doc.font('Helvetica-Bold')
           .fillColor('#000000')
           .text(formatCurrency(offer.total_tax), summaryX + 100, currentY, { width: 100, align: 'right' });

        // Gesamtbetrag (mit Hintergrund)
        currentY += 22;
        doc.rect(summaryX - 5, currentY - 5, summaryWidth + 10, 28)
           .fillColor(primaryRgb)
           .fill();

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#ffffff')
           .text('Gesamtbetrag:', summaryX, currentY + 3, { width: 100 })
           .text(formatCurrency(offer.total_gross), summaryX + 100, currentY + 3, { width: 100, align: 'right' });

        // ==================== ZAHLUNGSBEDINGUNGEN ====================
        currentY += 45;
        if (offer.payment_terms) {
          // Box
          doc.rect(leftMargin, currentY, contentWidth, 50)
             .fillColor('#f8f9fa')
             .fill();

          // Akzentstreifen
          doc.rect(leftMargin, currentY, 4, 50)
             .fillColor(secondaryRgb)
             .fill();

          doc.fontSize(10)
             .font('Helvetica-Bold')
             .fillColor(primaryRgb)
             .text('Zahlungsbedingungen', leftMargin + 15, currentY + 10);

          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('#555555')
             .text(offer.payment_terms, leftMargin + 15, currentY + 28, { width: contentWidth - 30 });

          currentY += 60;
        }

        // ==================== FUSSNOTEN-TEXT ====================
        if (offer.footer_text) {
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('#555555')
             .text(offer.footer_text, leftMargin, currentY, { width: contentWidth, lineGap: 3 });
          currentY = doc.y + 20;
        }

        // ==================== UNTERSCHRIFTEN ====================
        if (currentY < 650) {
          currentY = 680;
        } else {
          doc.addPage();
          currentY = 50;
        }

        const signatureWidth = 200;
        const signatureGap = 95;

        // Linke Unterschrift
        doc.moveTo(leftMargin, currentY)
           .lineTo(leftMargin + signatureWidth, currentY)
           .strokeColor('#333333')
           .lineWidth(0.5)
           .stroke();

        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Ort, Datum / Unterschrift Auftraggeber', leftMargin, currentY + 5, { width: signatureWidth, align: 'center' });

        // Rechte Unterschrift
        const rightSigX = leftMargin + signatureWidth + signatureGap;
        doc.moveTo(rightSigX, currentY)
           .lineTo(rightSigX + signatureWidth, currentY)
           .strokeColor('#333333')
           .lineWidth(0.5)
           .stroke();

        doc.text(`Unterschrift ${offer.company.name}`, rightSigX, currentY + 5, { width: signatureWidth, align: 'center' });

        // ==================== SEITEN-FOOTER ====================
        const footerY = 780;
        doc.moveTo(leftMargin, footerY)
           .lineTo(rightMargin, footerY)
           .strokeColor('#eeeeee')
           .lineWidth(0.5)
           .stroke();

        const footerText = `${offer.company.name} · ${offer.company.street || offer.company.address}, ${offer.company.postal_code || ''} ${offer.company.city || ''} · Steuernr.: ${offer.company.tax_number}`;
        const bankText = `${offer.company.bank_name} · IBAN: ${offer.company.iban} · BIC: ${offer.company.bic}`;

        // Verwende Schriftgröße aus Einstellungen
        doc.fontSize(settings.footer_font_size)
           .font(settings.font_family)
           .fillColor('#888888')
           .text(footerText, leftMargin, footerY + 8, { width: contentWidth, align: 'center' })
           .text(bankText, leftMargin, footerY + 18, { width: contentWidth, align: 'center' });

        // PDF abschließen
        doc.end();

      } catch (error) {
        logger.error('Fehler bei PDF-Generierung:', error);
        reject(error);
      }
    });
  }

  // Angebot-Vorschau als Base64
  async generateOfferPreview(offer: Parameters<typeof this.generateOffer>[0]): Promise<string> {
    const pdfBuffer = await this.generateOffer({ ...offer, is_draft: true });
    return pdfBuffer.toString('base64');
  }

  // Einfaches PDF aus HTML generieren (Legacy-Support, jetzt Text-basiert)
  async generateFromHTML(content: string, options: PDFOptions = {}): Promise<Buffer> {
    logger.info('Einfaches PDF wird generiert');

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: options.format || 'A4',
          layout: options.orientation || 'portrait',
          margins: {
            top: options.margin?.top || 50,
            bottom: options.margin?.bottom || 50,
            left: options.margin?.left || 50,
            right: options.margin?.right || 50,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Einfacher Text-Output (HTML-Tags entfernen)
        const plainText = content.replace(/<[^>]*>/g, '').trim();
        doc.fontSize(10)
           .font('Helvetica')
           .text(plainText, { align: 'left' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const pdfService = new PDFService();
