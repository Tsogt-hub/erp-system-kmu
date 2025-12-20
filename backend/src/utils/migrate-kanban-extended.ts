import { query } from '../config/database';
import { getRows } from './fix-models';
import { logger } from './logger';

/**
 * Migration for extended Kanban features (HubSpot-style)
 * - kanban_card_contacts: Multiple contacts per card
 * - kanban_card_attachments: File attachments
 * - kanban_card_linked_deals: Linked deals
 * - kanban_tasks: Tasks with due dates
 * - kanban_meetings: Scheduled meetings
 */

export async function migrateKanbanExtended(): Promise<void> {
  logger.info('🔄 Starting Kanban extended features migration...');

  try {
    // 1. Add new columns to kanban_cards table
    const cardColumns = [
      { name: 'deal_type', sql: 'ALTER TABLE kanban_cards ADD COLUMN deal_type TEXT' },
      { name: 'phone', sql: 'ALTER TABLE kanban_cards ADD COLUMN phone TEXT' },
      { name: 'street', sql: 'ALTER TABLE kanban_cards ADD COLUMN street TEXT' },
      { name: 'postal_code', sql: 'ALTER TABLE kanban_cards ADD COLUMN postal_code TEXT' },
      { name: 'city', sql: 'ALTER TABLE kanban_cards ADD COLUMN city TEXT' },
      { name: 'country', sql: 'ALTER TABLE kanban_cards ADD COLUMN country TEXT DEFAULT \'Deutschland\'' },
      { name: 'additional_info', sql: 'ALTER TABLE kanban_cards ADD COLUMN additional_info TEXT' },
      { name: 'expected_close_date', sql: 'ALTER TABLE kanban_cards ADD COLUMN expected_close_date TEXT' },
      { name: 'probability', sql: 'ALTER TABLE kanban_cards ADD COLUMN probability INTEGER DEFAULT 50' },
      { name: 'source', sql: 'ALTER TABLE kanban_cards ADD COLUMN source TEXT' },
    ];

    // Check existing columns
    const existingResult = await query('PRAGMA table_info(kanban_cards)', []);
    const existingColumns = getRows(existingResult).map((r: any) => r.name);

    for (const col of cardColumns) {
      if (!existingColumns.includes(col.name)) {
        try {
          await query(col.sql, []);
          logger.info(`  ✅ Added column ${col.name} to kanban_cards`);
        } catch (err: any) {
          if (!err.message?.includes('duplicate column')) {
            logger.warn(`  ⚠️ Could not add column ${col.name}: ${err.message}`);
          }
        }
      } else {
        logger.info(`  ℹ️ Column ${col.name} already exists`);
      }
    }

    // 2. Create kanban_card_contacts table (many-to-many relationship)
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_card_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        contact_id INTEGER NOT NULL,
        role TEXT DEFAULT 'primary',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES kanban_cards(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        UNIQUE(card_id, contact_id)
      )
    `, []);
    logger.info('  ✅ kanban_card_contacts table created/verified');

    // 3. Create kanban_card_attachments table
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_card_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        uploaded_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES kanban_cards(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )
    `, []);
    logger.info('  ✅ kanban_card_attachments table created/verified');

    // 4. Create kanban_card_linked_deals table
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_card_linked_deals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        linked_card_id INTEGER NOT NULL,
        relationship_type TEXT DEFAULT 'related',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES kanban_cards(id) ON DELETE CASCADE,
        FOREIGN KEY (linked_card_id) REFERENCES kanban_cards(id) ON DELETE CASCADE,
        UNIQUE(card_id, linked_card_id)
      )
    `, []);
    logger.info('  ✅ kanban_card_linked_deals table created/verified');

    // 5. Create kanban_tasks table
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        due_time TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        assigned_to INTEGER,
        completed_at DATETIME,
        completed_by INTEGER,
        reminder_date DATETIME,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES kanban_cards(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (completed_by) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `, []);
    logger.info('  ✅ kanban_tasks table created/verified');

    // 6. Create kanban_meetings table
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        meeting_date DATETIME NOT NULL,
        start_time TEXT,
        end_time TEXT,
        location TEXT,
        meeting_type TEXT DEFAULT 'in_person',
        status TEXT DEFAULT 'scheduled',
        organizer_id INTEGER NOT NULL,
        notes TEXT,
        outcome TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES kanban_cards(id) ON DELETE CASCADE,
        FOREIGN KEY (organizer_id) REFERENCES users(id)
      )
    `, []);
    logger.info('  ✅ kanban_meetings table created/verified');

    // 7. Create kanban_meeting_participants table
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_meeting_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INTEGER NOT NULL,
        user_id INTEGER,
        contact_id INTEGER,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES kanban_meetings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
      )
    `, []);
    logger.info('  ✅ kanban_meeting_participants table created/verified');

    // 8. Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_card_contacts_card ON kanban_card_contacts(card_id)',
      'CREATE INDEX IF NOT EXISTS idx_card_attachments_card ON kanban_card_attachments(card_id)',
      'CREATE INDEX IF NOT EXISTS idx_card_linked_deals_card ON kanban_card_linked_deals(card_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_card ON kanban_tasks(card_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON kanban_tasks(due_date)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_status ON kanban_tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_meetings_card ON kanban_meetings(card_id)',
      'CREATE INDEX IF NOT EXISTS idx_meetings_date ON kanban_meetings(meeting_date)',
    ];

    for (const idx of indexes) {
      try {
        await query(idx, []);
      } catch (err) {
        // Index might already exist
      }
    }
    logger.info('  ✅ Indexes created/verified');

    logger.info('✅ Kanban extended features migration completed');
  } catch (error: any) {
    logger.error(`❌ Kanban extended migration failed: ${error.message}`);
    throw error;
  }
}

