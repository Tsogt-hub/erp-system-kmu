import { db } from '../config/database.sqlite';

export interface PDFSettings {
  id: number;
  company_id?: number;
  document_type: string; // 'offer', 'invoice', 'order', 'default'
  
  // Briefpapier
  letterhead_url?: string;
  letterhead_first_page_only: boolean;
  
  // Farben
  primary_color: string;
  secondary_color: string;
  
  // Logo
  logo_url?: string;
  logo_position_x: number;
  logo_position_y: number;
  logo_width: number;
  
  // Schrift
  font_family: string;
  font_size: number;
  
  // Seitenränder (in mm)
  margin_top: number;
  margin_right: number;
  margin_bottom: number;
  margin_left: number;
  
  // Adressblock
  address_position_x: number;
  address_position_y: number;
  show_sender_line: boolean;
  
  // Header/Footer
  show_fold_marks: boolean;
  footer_font_size: number;
  
  // Textvorlagen
  intro_text_template?: string;
  footer_text_template?: string;
  
  created_at: Date;
  updated_at: Date;
}

export interface CreatePDFSettingsData {
  company_id?: number;
  document_type: string;
  letterhead_url?: string;
  letterhead_first_page_only?: boolean;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  logo_position_x?: number;
  logo_position_y?: number;
  logo_width?: number;
  font_family?: string;
  font_size?: number;
  margin_top?: number;
  margin_right?: number;
  margin_bottom?: number;
  margin_left?: number;
  address_position_x?: number;
  address_position_y?: number;
  show_sender_line?: boolean;
  show_fold_marks?: boolean;
  footer_font_size?: number;
  intro_text_template?: string;
  footer_text_template?: string;
}

// Standardwerte für neue Einstellungen (basierend auf Hero Software Elite PV Konfiguration)
export const DEFAULT_PDF_SETTINGS: Omit<PDFSettings, 'id' | 'created_at' | 'updated_at'> = {
  document_type: 'default',
  letterhead_first_page_only: true,
  // Elite PV Firmenfarben
  primary_color: '#1976D2',      // Elite PV Blau
  secondary_color: '#FF9800',     // Elite PV Orange/Akzent
  // Logo-Positionierung wie in Hero (rechts oben)
  logo_position_x: 425,           // 150mm = ~425pt (Position links in Hero)
  logo_position_y: 28,            // 10mm = ~28pt (Position oben in Hero)
  logo_width: 127,                // 45mm = ~127pt (Breite in Hero)
  // Schriftart und Größe wie in Hero
  font_family: 'Helvetica',       // Arial → Helvetica in PDFKit
  font_size: 9,                   // 9pt wie in Hero
  // Seitenränder wie in Hero (in Punkten, 1mm = 2.835pt)
  margin_top: 113,                // 40mm = ~113pt
  margin_right: 57,               // 20mm = ~57pt (Hauptblock rechts)
  margin_bottom: 99,              // 35mm = ~99pt
  margin_left: 71,                // 25mm = ~71pt (Hauptblock links)
  // Adressblock-Position wie in Hero
  address_position_x: 71,         // 25mm = ~71pt
  address_position_y: 127,        // 45mm = ~127pt
  show_sender_line: true,         // Eigene Adresszeile aktiviert
  show_fold_marks: true,          // Falzmarken aktiviert wie in Hero
  footer_font_size: 7,            // 7pt wie in Hero
};

export class PDFSettingsModel {
  static findByDocumentType(documentType: string): PDFSettings | null {
    const stmt = db.prepare(`
      SELECT * FROM pdf_settings 
      WHERE document_type = ?
      ORDER BY id DESC
      LIMIT 1
    `);
    return stmt.get(documentType) as PDFSettings | null;
  }

  static findAll(): PDFSettings[] {
    const stmt = db.prepare('SELECT * FROM pdf_settings ORDER BY document_type');
    return stmt.all() as PDFSettings[];
  }

  static findById(id: number): PDFSettings | null {
    const stmt = db.prepare('SELECT * FROM pdf_settings WHERE id = ?');
    return stmt.get(id) as PDFSettings | null;
  }

  static create(data: CreatePDFSettingsData): PDFSettings {
    const settings = { ...DEFAULT_PDF_SETTINGS, ...data };
    
    const stmt = db.prepare(`
      INSERT INTO pdf_settings (
        company_id, document_type, letterhead_url, letterhead_first_page_only,
        primary_color, secondary_color, logo_url, logo_position_x, logo_position_y,
        logo_width, font_family, font_size, margin_top, margin_right, margin_bottom,
        margin_left, address_position_x, address_position_y, show_sender_line,
        show_fold_marks, footer_font_size, intro_text_template, footer_text_template
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const result = stmt.run(
      settings.company_id || null,
      settings.document_type,
      settings.letterhead_url || null,
      settings.letterhead_first_page_only ? 1 : 0,
      settings.primary_color,
      settings.secondary_color,
      settings.logo_url || null,
      settings.logo_position_x,
      settings.logo_position_y,
      settings.logo_width,
      settings.font_family,
      settings.font_size,
      settings.margin_top,
      settings.margin_right,
      settings.margin_bottom,
      settings.margin_left,
      settings.address_position_x,
      settings.address_position_y,
      settings.show_sender_line ? 1 : 0,
      settings.show_fold_marks ? 1 : 0,
      settings.footer_font_size,
      settings.intro_text_template || null,
      settings.footer_text_template || null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(documentType: string, data: Partial<CreatePDFSettingsData>): PDFSettings {
    const existing = this.findByDocumentType(documentType);
    
    if (!existing) {
      // Erstelle neue Einstellungen wenn keine existieren
      return this.create({ ...data, document_type: documentType });
    }

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'document_type') {
        fields.push(`${key} = ?`);
        // Boolean-Werte zu 0/1 konvertieren
        if (typeof value === 'boolean') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    });

    if (fields.length === 0) {
      return existing;
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(existing.id);

    const stmt = db.prepare(`
      UPDATE pdf_settings 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.findById(existing.id)!;
  }

  static delete(id: number): void {
    const stmt = db.prepare('DELETE FROM pdf_settings WHERE id = ?');
    stmt.run(id);
  }

  static getOrCreateDefault(documentType: string): PDFSettings {
    let settings = this.findByDocumentType(documentType);
    
    if (!settings) {
      // Versuche zuerst die Default-Einstellungen zu laden
      settings = this.findByDocumentType('default');
      
      if (!settings) {
        // Erstelle Default-Einstellungen
        settings = this.create({ document_type: 'default' });
      }
      
      // Falls ein spezifischer Dokumententyp angefragt wurde, kopiere die Defaults
      if (documentType !== 'default') {
        const { id, created_at, updated_at, ...settingsData } = settings;
        settings = this.create({ ...settingsData, document_type: documentType });
      }
    }
    
    return settings;
  }
}

