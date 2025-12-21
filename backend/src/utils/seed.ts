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

    await query(
      `INSERT INTO roles (name, permissions)
       VALUES 
        ('admin', $1),
        ('operations_lead', $2),
        ('project_manager', $3),
        ('employee', $4)
       ON CONFLICT (name) DO NOTHING`,
      [
        JSON.stringify(['metadata:read', 'metadata:write', 'governance:manage', 'users:manage', 'audit:read', 'pipelines:run', 'feature-store:read', 'feature-store:write', 'feature-store:sync']),
        JSON.stringify(['metadata:read', 'pipelines:run', 'audit:read']),
        JSON.stringify(['metadata:read']),
        JSON.stringify([]),
      ]
    );

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

    // Erstelle Dummy-Artikel für Angebote
    const itemsCheck = await query('SELECT COUNT(*) as count FROM items');
    if (parseInt(itemsCheck.rows[0].count) === 0) {
      await query(
        `INSERT INTO items (sku, name, description, category, unit, price, vat_rate, is_active, is_service) VALUES
         ('PV-MOD-400', 'PV-Modul 400W', 'Hochleistungs-Solarmodul 400 Watt', 'Modul', 'Stück', 180.00, 19.00, true, false),
         ('WR-HYB-10K', 'Wechselrichter 10kW', 'Hybrid-Wechselrichter 10 kW', 'Wechselrichter', 'Stück', 2500.00, 19.00, true, false),
         ('MONT-FLACH', 'Montagesystem Flachdach', 'Komplett-Set für Flachdachmontage', 'Montagesystem', 'Set', 450.00, 19.00, true, false),
         ('KAB-SOL-6', 'Kabel Solar 6mm²', 'Solarkabel 6mm², schwarz, 100m Rolle', 'Kabel', 'Rolle', 120.00, 19.00, true, false),
         ('INST-PAUSCH', 'Installation Pauschal', 'Installationsarbeiten Pauschal', 'Dienstleistung', 'Pauschal', 1500.00, 19.00, true, true)
         ON CONFLICT (sku) DO NOTHING`
      );
      console.log('✅ Dummy-Artikel erstellt');
    }

    // Erstelle Test-Kontakt für Angebote
    const contactCheck = await query('SELECT COUNT(*) as count FROM contacts');
    if (parseInt(contactCheck.rows[0].count) === 0) {
      await query(
        `INSERT INTO contacts (first_name, last_name, email, phone, company_id)
         VALUES ('Theodor', 'Siegrdrief', 'theodor@example.com', '0123456789', 1)
         ON CONFLICT DO NOTHING`
      );
      console.log('✅ Test-Kontakt erstellt');
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












