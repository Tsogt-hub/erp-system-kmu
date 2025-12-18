// Migration für neue Offer-Felder (intro_text, footer_text, payment_terms, finalized_at)

import Database from 'better-sqlite3';
import path from 'path';
import { logger } from './logger';

export async function migrateOfferFields(): Promise<void> {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../../data/erp.db');
  const db = new Database(dbPath);

  try {
    logger.info('Starte Migration: Offer-Felder erweitern...');

    // Prüfen ob die Felder bereits existieren
    const tableInfo = db.prepare("PRAGMA table_info(offers)").all() as { name: string }[];
    const existingColumns = tableInfo.map(col => col.name);

    const newColumns = [
      { name: 'intro_text', type: 'TEXT' },
      { name: 'footer_text', type: 'TEXT' },
      { name: 'payment_terms', type: 'TEXT' },
      { name: 'finalized_at', type: 'DATETIME' },
    ];

    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        logger.info(`Füge Spalte ${column.name} hinzu...`);
        db.exec(`ALTER TABLE offers ADD COLUMN ${column.name} ${column.type}`);
      } else {
        logger.info(`Spalte ${column.name} existiert bereits`);
      }
    }

    // Default-Werte für bestehende Angebote setzen
    const updateIntro = db.prepare(`
      UPDATE offers 
      SET intro_text = 'Vielen Dank für Ihr Interesse. Gerne unterbreiten wir Ihnen folgendes Angebot:'
      WHERE intro_text IS NULL
    `);
    updateIntro.run();

    const updatePayment = db.prepare(`
      UPDATE offers 
      SET payment_terms = 'Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt ohne Abzug.'
      WHERE payment_terms IS NULL
    `);
    updatePayment.run();

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
  migrateOfferFields()
    .then(() => {
      console.log('Migration abgeschlossen');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration fehlgeschlagen:', error);
      process.exit(1);
    });
}
