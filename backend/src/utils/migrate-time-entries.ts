import { query, isPostgres } from '../config/database';
import { logger } from './logger';

export async function migrateTimeEntries() {
  logger.info('🔄 Migrating time_entries table...');
  
  try {
    const usingPostgres = isPostgres();
    logger.info(`  📋 Database type: ${usingPostgres ? 'PostgreSQL' : 'SQLite'}`);
    
    if (usingPostgres) {
      // For PostgreSQL - check if start_time column exists
      const checkResult = await query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'time_entries' AND column_name = 'start_time'
      `);
      
      const hasStartTime = checkResult.rows && checkResult.rows.length > 0;
      
      if (!hasStartTime) {
        logger.info('  📋 Recreating time_entries table with new schema...');
        
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
      const result = await query('PRAGMA table_info(time_entries)');
      const columns = result.rows || result || [];
      const hasStartTime = Array.isArray(columns) && columns.some((col: any) => col.name === 'start_time');
      
      if (!hasStartTime) {
        logger.info('  📋 Recreating time_entries table with new schema...');
        
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
    // Don't throw - let the app continue even if migration fails
    // The table might already exist with the correct schema
  }
}

