const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

// Öffne SQLite-Datenbank
const dbPath = path.join(__dirname, 'data', 'erp_system_kmu.sqlite');
const db = new Database(dbPath);

async function createUser() {
  try {
    // Prüfe ob Benutzer bereits existiert
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get('tsogtnandin@elite-pv.de');
    
    if (existingUser) {
      console.log('✅ Benutzer existiert bereits:', existingUser.email);
      console.log('🔄 Setze Passwort zurück...');
      
      // Setze Passwort zurück
      const passwordHash = await bcrypt.hash('password123', 10);
      db.prepare('UPDATE users SET password_hash = ?, is_active = ? WHERE email = ?').run(
        passwordHash,
        1, // true als 1 für SQLite
        'tsogtnandin@elite-pv.de'
      );
      
      console.log('✅ Passwort erfolgreich zurückgesetzt!');
      console.log('📧 E-Mail: tsogtnandin@elite-pv.de');
      console.log('🔑 Passwort: password123');
      return;
    }

    // Erstelle Passwort-Hash
    const passwordHash = await bcrypt.hash('password123', 10);

    // Erstelle Benutzer
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'tsogtnandin@elite-pv.de',
      passwordHash,
      'Tsogtnandin',
      'Erdene',
      1, // Admin role
      true
    );

    console.log('✅ Benutzer erfolgreich erstellt!');
    console.log('📧 E-Mail: tsogtnandin@elite-pv.de');
    console.log('🔑 Passwort: password123');
  } catch (error) {
    console.error('❌ Fehler:', error.message);
    throw error;
  }
}

createUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

