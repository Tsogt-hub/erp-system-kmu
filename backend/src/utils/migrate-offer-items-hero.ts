import { query } from '../config/database';

/**
 * Migration für Hero-Features in Offer Items
 * Fügt neue Felder hinzu: item_type, parent_item_id, image_url, notes, is_visible, purchase_price
 */
export async function migrateOfferItemsHero(): Promise<void> {
  console.log('🔄 Migrating offer_items table for Hero features...');

  const newColumns = [
    { name: 'item_type', type: "TEXT DEFAULT 'standard'" },
    { name: 'parent_item_id', type: 'INTEGER' },
    { name: 'image_url', type: 'TEXT' },
    { name: 'notes', type: 'TEXT' },
    { name: 'is_visible', type: 'INTEGER DEFAULT 1' },
    { name: 'purchase_price', type: 'REAL' },
  ];

  for (const column of newColumns) {
    try {
      await query(`ALTER TABLE offer_items ADD COLUMN ${column.name} ${column.type}`, []);
      console.log(`  ✅ Added column: ${column.name}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate column name')) {
        console.log(`  ℹ️ Column ${column.name} already exists`);
      } else {
        console.error(`  ❌ Error adding column ${column.name}:`, error.message);
      }
    }
  }

  console.log('✅ Offer items table migration complete');
}









