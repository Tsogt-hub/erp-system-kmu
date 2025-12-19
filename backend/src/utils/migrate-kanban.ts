import { query } from '../config/database';
import { logger } from './logger';

// Detect if we're using SQLite or PostgreSQL
const isSQLite = process.env.DATABASE_URL?.includes('sqlite') || !process.env.DATABASE_URL;

export async function migrateKanbanTables(): Promise<void> {
  try {
    // Drop existing tables if they have wrong schema (for SQLite fix)
    if (isSQLite) {
      try {
        // Check if kanban_boards has wrong id column
        const checkResult = await query(`SELECT id FROM kanban_boards LIMIT 1`);
        // If we get here, table exists - check if id is null
        if (checkResult.rows.length > 0 && checkResult.rows[0].id === null) {
          logger.info('⚠️ Kanban tables have wrong schema, recreating...');
          await query(`DROP TABLE IF EXISTS kanban_activities`);
          await query(`DROP TABLE IF EXISTS kanban_cards`);
          await query(`DROP TABLE IF EXISTS kanban_columns`);
          await query(`DROP TABLE IF EXISTS kanban_boards`);
        }
      } catch (e) {
        // Table doesn't exist, that's fine
      }
    }

    // Use SQLite-compatible or PostgreSQL syntax
    const idColumn = isSQLite 
      ? 'id INTEGER PRIMARY KEY AUTOINCREMENT'
      : 'id SERIAL PRIMARY KEY';
    
    const jsonType = isSQLite ? 'TEXT' : 'JSONB';
    const boolDefault = isSQLite ? '0' : 'false';

    // Create kanban_boards table
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_boards (
        ${idColumn},
        name VARCHAR(255) NOT NULL,
        description TEXT,
        board_type VARCHAR(50) DEFAULT 'custom',
        created_by INTEGER REFERENCES users(id),
        is_default BOOLEAN DEFAULT ${boolDefault},
        settings ${jsonType},
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('✅ kanban_boards table created/verified');

    // Create kanban_columns table
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_columns (
        ${idColumn},
        board_id INTEGER REFERENCES kanban_boards(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        position INTEGER DEFAULT 0,
        color VARCHAR(20) DEFAULT '#1976D2',
        wip_limit INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('✅ kanban_columns table created/verified');

    // Create kanban_cards table
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_cards (
        ${idColumn},
        column_id INTEGER REFERENCES kanban_columns(id) ON DELETE CASCADE,
        board_id INTEGER REFERENCES kanban_boards(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        position INTEGER DEFAULT 0,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
        company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        due_date TIMESTAMP,
        amount DECIMAL(15, 2),
        priority VARCHAR(20) DEFAULT 'medium',
        labels ${jsonType},
        custom_fields ${jsonType},
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('✅ kanban_cards table created/verified');

    // Create kanban_activities table
    await query(`
      CREATE TABLE IF NOT EXISTS kanban_activities (
        ${idColumn},
        card_id INTEGER REFERENCES kanban_cards(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        activity_type VARCHAR(50) NOT NULL,
        content TEXT,
        metadata ${jsonType},
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('✅ kanban_activities table created/verified');

    // Create indexes for performance
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_kanban_columns_board ON kanban_columns(board_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON kanban_cards(column_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_kanban_cards_board ON kanban_cards(board_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_kanban_activities_card ON kanban_activities(card_id)`);
      logger.info('✅ Kanban indexes created/verified');
    } catch (e) {
      // Indexes might already exist
    }

    logger.info('✅ Kanban tables migration completed');
  } catch (error: any) {
    logger.error('❌ Kanban tables migration failed:', error.message);
    throw error;
  }
}

