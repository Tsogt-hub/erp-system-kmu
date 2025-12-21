import { query, isPostgres } from '../config/database';
import { logger } from './logger';

export async function migrateTimeEntries() {
  logger.info('🔄 Migrating time_entries table...');
  
  try {
    // Check if the table exists and has the old schema
    const checkColumn = isPostgres()
      ? `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'time_entries' AND column_name = 'start_time'`
      : `PRAGMA table_info(time_entries)`;
    
    const result = await query(checkColumn);
    
    if (isPostgres()) {
      // For PostgreSQL
      const hasStartTime = result.rows.some((row: any) => row.column_name === 'start_time');
      
      if (!hasStartTime) {
        // The table has old schema, we need to drop and recreate
        logger.info('  📋 Dropping old time_entries table and recreating with new schema...');
        
        await query('DROP TABLE IF EXISTS time_entries CASCADE');
        
        await query(`
          CREATE TABLE time_entries (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP,
            break_duration INTEGER DEFAULT 0,
            description TEXT,
            type VARCHAR(50) DEFAULT 'work',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        logger.info('  ✅ time_entries table recreated with new schema');
      } else {
        logger.info('  ℹ️ time_entries table already has correct schema');
      }
    } else {
      // For SQLite
      const columns = result.rows || result;
      const hasStartTime = columns.some((col: any) => col.name === 'start_time');
      
      if (!hasStartTime) {
        logger.info('  📋 Dropping old time_entries table and recreating with new schema...');
        
        await query('DROP TABLE IF EXISTS time_entries');
        
        await query(`
          CREATE TABLE time_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            project_id INTEGER,
            start_time DATETIME NOT NULL,
            end_time DATETIME,
            break_duration INTEGER DEFAULT 0,
            description TEXT,
            type TEXT DEFAULT 'work',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (project_id) REFERENCES projects(id)
          )
        `);
        
        logger.info('  ✅ time_entries table recreated with new schema');
      } else {
        logger.info('  ℹ️ time_entries table already has correct schema');
      }
    }
    
    logger.info('✅ Time entries migration complete');
  } catch (error: any) {
    logger.error('❌ Time entries migration failed:', error.message);
    throw error;
  }
}

