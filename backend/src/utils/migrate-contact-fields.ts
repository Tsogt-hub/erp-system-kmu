import { db } from '../config/database.sqlite';
import { pool } from '../config/database';
import { logger } from './logger';

export async function migrateContactFields() {
  logger.info('🔄 Starte Migration für erweiterte Kontaktfelder...');

  try {
    // Check if PostgreSQL is available
    const isPostgres = await pool.query('SELECT 1').then(() => true).catch(() => false);

    if (isPostgres) {
      // PostgreSQL Migration
      await pool.query(`
        ALTER TABLE contacts 
        ADD COLUMN IF NOT EXISTS customer_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
        ADD COLUMN IF NOT EXISTS availability VARCHAR(50),
        ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'contact',
        ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'person',
        ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
      `);
      
      // Create index for customer_number
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_contacts_customer_number ON contacts(customer_number);
      `);
      
      logger.info('✅ PostgreSQL: Kontaktfelder erweitert und Indizes erstellt.');
    } else {
      // SQLite Migration
      // SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
      // We need to check if columns exist first
      const tableInfo = db.prepare("PRAGMA table_info(contacts)").all() as any[];
      const columnNames = tableInfo.map((col: any) => col.name);

      const columnsToAdd = [
        { name: 'customer_number', type: 'TEXT' },
        { name: 'address', type: 'TEXT' },
        { name: 'postal_code', type: 'TEXT' },
        { name: 'availability', type: 'TEXT' },
        { name: 'category', type: 'TEXT DEFAULT "contact"' },
        { name: 'type', type: 'TEXT DEFAULT "person"' },
        { name: 'is_archived', type: 'INTEGER DEFAULT 0' },
      ];

      for (const column of columnsToAdd) {
        if (!columnNames.includes(column.name)) {
          db.exec(`ALTER TABLE contacts ADD COLUMN ${column.name} ${column.type}`);
          logger.info(`✅ SQLite: Spalte ${column.name} hinzugefügt.`);
        }
      }

      // Create index for customer_number
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_contacts_customer_number ON contacts(customer_number);
      `);
      
      logger.info('✅ SQLite: Kontaktfelder erweitert und Indizes erstellt.');
    }
    logger.info('✅ Migration für erweiterte Kontaktfelder abgeschlossen.');
  } catch (error: any) {
    logger.error('❌ Fehler bei der Migration für Kontaktfelder:', error.message);
    throw error;
  }
}





