import { query } from '../config/database';
import bcrypt from 'bcrypt';

export async function seedDatabase() {
  console.log('🌱 Starte Datenbank-Seeding...');

  try {
    // Prüfe ob bereits Daten vorhanden sind
    const userCheck = await query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCheck.rows[0].count) > 0) {
      console.log('✅ Datenbank bereits mit Daten gefüllt');
      return;
    }

    // Erstelle Admin-Benutzer
    const passwordHash = await bcrypt.hash('admin123', 10);
    await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@test.com', passwordHash, 'Admin', 'Test', 1]
    );

    // Erstelle Test-Unternehmen
    await query(
      `INSERT INTO companies (name, email, phone, city)
       VALUES 
       ('Test GmbH', 'info@test.de', '0123456789', 'Berlin'),
       ('Muster AG', 'kontakt@muster.de', '0987654321', 'München')
       ON CONFLICT DO NOTHING`
    );

    // Erstelle Test-Projekt
    const companyResult = await query('SELECT id FROM companies LIMIT 1');
    if (companyResult.rows.length > 0) {
      const companyId = companyResult.rows[0].id;
      await query(
        `INSERT INTO projects (name, reference, customer_id, status, created_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        ['Test-Projekt', 'PRJ-2024-001', companyId, 'active', 1]
      );
    }

    console.log('✅ Datenbank-Seeding abgeschlossen!');
    console.log('📋 Login-Daten:');
    console.log('   E-Mail: admin@test.com');
    console.log('   Passwort: admin123');
  } catch (error) {
    console.error('❌ Fehler beim Seeding:', error);
    throw error;
  }
}

// Ausführen wenn direkt aufgerufen
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}





