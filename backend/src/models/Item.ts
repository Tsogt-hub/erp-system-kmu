import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface Item {
  id: number;
  name: string;
  sku?: string;
  ean?: string;  // Europäische Artikelnummer (Barcode)
  description?: string;
  unit: string;
  price: number;
  purchase_price?: number;
  sales_price?: number;
  margin_percent?: number;
  vat_rate?: number;  // MwSt-Satz: 0, 7, 19
  category?: string;
  manufacturer?: string;
  supplier_id?: number;  // Lieferant (FK zu contacts)
  supplier_article_number?: string;  // Lieferanten-Artikelnummer
  cost_center?: string;  // Kostenstelle
  price_calculation_id?: number;  // Preisberechnungsformel (FK zu price_calculations)
  image_url?: string;
  stock_quantity?: number;
  min_stock?: number;
  is_service: boolean;  // Unterscheidung Artikel vs. Leistung
  time_minutes?: number;  // Zeitaufwand in Minuten (für Leistungen)
  internal_name?: string;  // Interner Suchname (für Leistungen)
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateItemData {
  name: string;
  sku?: string;
  ean?: string;
  description?: string;
  unit?: string;
  price?: number;
  purchase_price?: number;
  sales_price?: number;
  margin_percent?: number;
  vat_rate?: number;
  category?: string;
  manufacturer?: string;
  supplier_id?: number;
  supplier_article_number?: string;
  cost_center?: string;
  price_calculation_id?: number;
  image_url?: string;
  stock_quantity?: number;
  min_stock?: number;
  is_service?: boolean;
  time_minutes?: number;
  internal_name?: string;
}

// Artikelkategorien
export const ITEM_CATEGORIES = [
  'Modul',
  'Wechselrichter',
  'Mikrowechselrichter',
  'Speicher',
  'Wallbox',
  'Optimierer',
  'Controller',
  'Notstrom',
  'Montagesystem',
  'Zubehör',
  'Kabel',
  'Netzwerk',
  'Zählerschrank',
  'Infrastruktur',
  'Dienstleistung'
];

/**
 * Initialisiert die Items-Tabelle mit allen erforderlichen Spalten
 * Basierend auf Hero-Software Artikelstamm-Analyse
 */
export async function initItemsTable(): Promise<void> {
  // Prüfe und füge fehlende Spalten hinzu
  const columnsToAdd = [
    { name: 'purchase_price', type: 'REAL DEFAULT 0' },
    { name: 'sales_price', type: 'REAL DEFAULT 0' },
    { name: 'margin_percent', type: 'REAL DEFAULT 0' },
    { name: 'manufacturer', type: 'TEXT' },
    { name: 'image_url', type: 'TEXT' },
    { name: 'stock_quantity', type: 'INTEGER DEFAULT 0' },
    { name: 'min_stock', type: 'INTEGER DEFAULT 0' },
    // Neue Felder basierend auf Hero-Analyse
    { name: 'ean', type: 'TEXT' },  // Europäische Artikelnummer
    { name: 'vat_rate', type: 'REAL DEFAULT 19' },  // MwSt-Satz
    { name: 'supplier_id', type: 'INTEGER' },  // FK zu contacts
    { name: 'supplier_article_number', type: 'TEXT' },  // Lieferanten-Artikelnummer
    { name: 'cost_center', type: 'TEXT' },  // Kostenstelle
    { name: 'price_calculation_id', type: 'INTEGER' },  // FK zu price_calculations
    { name: 'is_service', type: 'INTEGER DEFAULT 0' },  // Leistung vs. Artikel
    { name: 'time_minutes', type: 'INTEGER DEFAULT 0' },  // Zeitaufwand für Leistungen
    { name: 'internal_name', type: 'TEXT' }  // Interner Suchname
  ];

  for (const col of columnsToAdd) {
    try {
      await query(`ALTER TABLE items ADD COLUMN ${col.name} ${col.type}`);
      console.log(`  ✅ Spalte ${col.name} hinzugefügt`);
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.code === 'SQLITE_ERROR') {
        console.log(`  ℹ️ Spalte ${col.name} existiert bereits`);
      } else {
        throw error;
      }
    }
  }
  
  console.log('✅ Items table initialized');
}

/**
 * Verkaufspreisberechnung (wie Hero)
 */
export interface PriceCalculation {
  id: number;
  name: string;
  formula: string;  // z.B. "purchase_price * 1.30" oder "purchase_price + 50"
  margin_percent?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Initialisiert die Preisberechnungs-Tabelle
 */
export async function initPriceCalculationsTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS price_calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        formula TEXT NOT NULL,
        margin_percent REAL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Standard-Preisberechnung einfügen (wie Hero)
    await query(`
      INSERT OR IGNORE INTO price_calculations (id, name, formula, margin_percent)
      VALUES (1, 'Verkaufspreis Standard', 'purchase_price * 1.30', 30)
    `);
    
    console.log('✅ Price calculations table initialized');
  } catch (error: any) {
    console.error('Error initializing price_calculations table:', error.message);
  }
}

export class ItemModel {
  static async findById(id: number): Promise<Item | null> {
    const result = await query('SELECT * FROM items WHERE id = $1', [id]);
    return getRow(result);
  }

  static async findBySKU(sku: string): Promise<Item | null> {
    const result = await query('SELECT * FROM items WHERE sku = $1', [sku]);
    return getRow(result);
  }

  static async findAll(): Promise<Item[]> {
    const result = await query('SELECT * FROM items WHERE is_active = 1 ORDER BY name ASC');
    return getRows(result);
  }

  static async search(searchTerm: string): Promise<Item[]> {
    const result = await query(
      `SELECT * FROM items 
       WHERE (name LIKE $1 OR sku LIKE $1 OR description LIKE $1) AND is_active = 1
       ORDER BY name ASC`,
      [`%${searchTerm}%`]
    );
    return getRows(result);
  }

  static async create(data: CreateItemData): Promise<Item> {
    const result = await query(
      `INSERT INTO items (name, sku, description, unit, price, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.name,
        data.sku || null,
        data.description || null,
        data.unit || 'Stück',
        data.price || 0,
        data.category || null,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateItemData>): Promise<Item> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('UPDATE items SET is_active = false WHERE id = $1', [id]);
  }
}

