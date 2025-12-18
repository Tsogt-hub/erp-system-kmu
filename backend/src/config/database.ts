import { Pool } from 'pg';
import { config } from './env';

let useSQLite = false;

// Prüfe ob PostgreSQL verfügbar ist
async function checkPostgreSQL() {
  try {
    const testPool = new Pool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      connectionTimeoutMillis: 2000,
    });
    await testPool.query('SELECT NOW()');
    await testPool.end();
    return true;
  } catch (error) {
    return false;
  }
}

// Versuche PostgreSQL zu verbinden, sonst nutze SQLite
const initDatabase = async () => {
  const pgAvailable = await checkPostgreSQL();
  if (!pgAvailable) {
    console.log('⚠️  PostgreSQL nicht verfügbar, verwende SQLite...');
    useSQLite = true;
    const { initSQLiteDatabase } = await import('../utils/init-sqlite');
    await initSQLiteDatabase();
    return;
  }
  
  useSQLite = false;
};

// Initialisiere Datenbank beim Import
initDatabase().catch(console.error);

// PostgreSQL Pool (wird nur verwendet wenn PostgreSQL verfügbar)
export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL Database connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err);
});

export const query = async (text: string, params?: any[]): Promise<any> => {
  if (useSQLite) {
    const { query: sqliteQuery } = await import('./database.sqlite');
    return sqliteQuery(text, params || []);
  }
  
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const code = (error as any)?.code;
    const name = (error as any)?.name;
    const message = (error as any)?.message ?? '';
    if (code === 'ECONNREFUSED' || name === 'AggregateError' || message.includes('ECONNREFUSED')) {
      if (!useSQLite) {
        console.warn('⚠️  PostgreSQL nicht erreichbar, wechsle zu SQLite...', { message: (error as any)?.message });
        useSQLite = true;
        const { initSQLiteDatabase } = await import('../utils/init-sqlite');
        await initSQLiteDatabase();
      }
      return query(text, params);
    }
    console.error('Database query error:', error);
    throw error;
  }
};

