import { query } from '../config/database';

/**
 * Migration für Hero-Features in Kontakten
 * Fügt neue Felder hinzu: city, country, salutation, lead_source, website, fax, birthday, is_invoice_recipient, additional_salutation
 */
export async function migrateContactsTable(): Promise<void> {
  console.log('🔄 Migrating contacts table for Hero features...');

  const newColumns = [
    { name: 'city', type: 'TEXT' },
    { name: 'country', type: 'TEXT' },
    { name: 'salutation', type: 'TEXT' },
    { name: 'lead_source', type: 'TEXT' },
    { name: 'website', type: 'TEXT' },
    { name: 'fax', type: 'TEXT' },
    { name: 'birthday', type: 'TEXT' },
    { name: 'is_invoice_recipient', type: 'INTEGER DEFAULT 0' },
    { name: 'additional_salutation', type: 'TEXT' },
  ];

  for (const column of newColumns) {
    try {
      await query(`ALTER TABLE contacts ADD COLUMN ${column.name} ${column.type}`, []);
      console.log(`  ✅ Added column: ${column.name}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate column name')) {
        console.log(`  ℹ️ Column ${column.name} already exists`);
      } else {
        console.error(`  ❌ Error adding column ${column.name}:`, error.message);
      }
    }
  }

  console.log('✅ Contacts table migration complete');
}









