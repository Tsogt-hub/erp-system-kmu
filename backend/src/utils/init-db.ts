import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export async function initDatabase() {
  console.log('🗄️  Initialisiere Datenbank...');

  try {
    // Verbinde zur PostgreSQL (ohne spezifische Datenbank)
    const adminPool = new Pool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: 'postgres', // Verbinde zur Standard-Datenbank
    });

    // Erstelle Datenbank falls nicht vorhanden
    try {
      await adminPool.query(`CREATE DATABASE ${config.db.name}`);
      console.log(`✅ Datenbank "${config.db.name}" erstellt`);
    } catch (error: any) {
      if (error.code === '42P04') {
        console.log(`ℹ️  Datenbank "${config.db.name}" existiert bereits`);
      } else {
        throw error;
      }
    }

    await adminPool.end();

    // Verbinde zur neuen Datenbank
    const pool = new Pool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
    });

    // Prüfe ob Tabellen existieren
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (tablesCheck.rows.length === 0) {
      console.log('📋 Führe Datenbank-Schema aus...');
      
      // Lese Schema-Datei
      const schemaPath = path.join(__dirname, '../../database/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      
      // Führe Schema aus
      await pool.query(schema);
      console.log('✅ Datenbank-Schema ausgeführt');
    } else {
      console.log('✅ Datenbank-Tabellen existieren bereits');
    }

    await pool.end();
    console.log('✅ Datenbank initialisiert!');
    return true;
  } catch (error: any) {
    console.error('❌ Fehler bei Datenbank-Initialisierung:', error.message);
    console.error('');
    console.error('📝 Mögliche Lösungen:');
    console.error('1. PostgreSQL installieren und starten');
    console.error('2. Docker starten: docker-compose -f docker/docker-compose.yml up -d');
    console.error('3. Datenbank-Verbindung in backend/.env prüfen');
    return false;
  }
}

// Ausführen wenn direkt aufgerufen
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}






