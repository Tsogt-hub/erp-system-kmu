import { query } from '../config/database';
import { logger } from './logger';

export async function migrateOfferItems() {
  try {
    // Check if offer_items table exists (SQLite)
    const checkTable = await query(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='offer_items'`
    );
    const rows = Array.isArray(checkTable) ? checkTable : checkTable.rows;

    if (rows.length === 0) {
      logger.info('Creating offer_items table...');
      await query(`
        CREATE TABLE IF NOT EXISTS offer_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          offer_id INTEGER NOT NULL,
          item_id INTEGER,
          description TEXT NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT DEFAULT 'Stück',
          unit_price REAL NOT NULL,
          discount_percent REAL DEFAULT 0,
          tax_rate REAL DEFAULT 19.00,
          position_order INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
          FOREIGN KEY (item_id) REFERENCES items(id)
        )
      `);

      await query(`CREATE INDEX IF NOT EXISTS idx_offer_items_offer ON offer_items(offer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_offer_items_item ON offer_items(item_id)`);
      logger.info('offer_items table created successfully.');
    } else {
      logger.info('offer_items table already exists.');
    }
  } catch (error: any) {
    // If error is not about table not existing, it might be PostgreSQL
    if (error.message && error.message.includes('sqlite_master')) {
      // PostgreSQL doesn't have sqlite_master, try to create table directly
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS offer_items (
            id SERIAL PRIMARY KEY,
            offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE NOT NULL,
            item_id INTEGER REFERENCES items(id),
            description VARCHAR(500) NOT NULL,
            quantity DECIMAL(10, 2) NOT NULL,
            unit VARCHAR(50) DEFAULT 'Stück',
            unit_price DECIMAL(10, 2) NOT NULL,
            discount_percent DECIMAL(5, 2) DEFAULT 0,
            tax_rate DECIMAL(5, 2) DEFAULT 19.00,
            position_order INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await query(`CREATE INDEX IF NOT EXISTS idx_offer_items_offer ON offer_items(offer_id)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_offer_items_item ON offer_items(item_id)`);
        logger.info('offer_items table created successfully (PostgreSQL).');
      } catch (pgError: any) {
        logger.warn('Could not create offer_items table:', pgError.message);
      }
    } else {
      logger.error('Error during offer_items migration:', error.message);
      throw error;
    }
  }
}







