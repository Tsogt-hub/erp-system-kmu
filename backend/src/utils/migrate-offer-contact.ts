// Migration für contact_id in offers Tabelle

import Database from 'better-sqlite3';
import path from 'path';
import { logger } from './logger';

export async function migrateOfferContact(): Promise<void> {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../../data/erp_system_kmu.sqlite');
  const db = new Database(dbPath);

  try {
    logger.info('Starte Migration: contact_id für Angebote hinzufügen...');

    // Prüfen ob die Spalte bereits existiert
    const tableInfo = db.prepare("PRAGMA table_info(offers)").all() as { name: string }[];
    const existingColumns = tableInfo.map(col => col.name);

    if (!existingColumns.includes('contact_id')) {
      logger.info('Füge Spalte contact_id hinzu...');
      db.exec(`ALTER TABLE offers ADD COLUMN contact_id INTEGER REFERENCES contacts(id)`);
      logger.info('Spalte contact_id erfolgreich hinzugefügt');
    } else {
      logger.info('Spalte contact_id existiert bereits');
    }

    logger.info('Migration erfolgreich abgeschlossen');
  } catch (error) {
    logger.error('Fehler bei der Migration:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Wenn direkt ausgeführt
if (require.main === module) {
  migrateOfferContact()
    .then(() => {
      console.log('Migration abgeschlossen');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration fehlgeschlagen:', error);
      process.exit(1);
    });
}

