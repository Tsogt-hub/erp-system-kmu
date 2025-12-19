import { db } from '../config/database.sqlite';
import { initSQLiteDatabase } from './init-sqlite';
import * as bcrypt from 'bcrypt';
import { ELITE_PV_COMPANY, ELITE_PV_OFFER_TEXTS } from '../seeds/elite-pv-config';

interface QueryResult {
  rows: any[];
  rowCount: number;
}

// Direkte SQLite-Query-Funktion
const query = async (text: string, params: any[] = []): Promise<QueryResult> => {
  try {
    let sqliteText = text.replace(/\$(\d+)/g, '?');
    const stmt = db.prepare(sqliteText);
    
    if (sqliteText.trim().toUpperCase().startsWith('SELECT')) {
      const result = stmt.all(...params);
      return { rows: result, rowCount: result.length };
    } else {
      stmt.run(...params);
      if (sqliteText.toUpperCase().includes('RETURNING')) {
        const returnMatch = text.match(/RETURNING (.+)/i);
        const returnCols = returnMatch ? returnMatch[1].trim() : '*';
        const tableMatch = sqliteText.match(/INSERT INTO (\w+)|UPDATE (\w+)/i);
        const tableName = tableMatch?.[1] || tableMatch?.[2];
        
        if (sqliteText.trim().toUpperCase().startsWith('INSERT')) {
          const lastId = db.prepare('SELECT last_insert_rowid() as id').get() as any;
          const selectStmt = db.prepare(`SELECT ${returnCols} FROM ${tableName} WHERE id = ?`);
          const result = selectStmt.get(lastId.id);
          return { rows: result ? [result] : [], rowCount: result ? 1 : 0 };
        } else if (sqliteText.trim().toUpperCase().startsWith('UPDATE')) {
          const idMatch = sqliteText.match(/WHERE id = \?/);
          if (idMatch && params.length > 0 && tableName) {
            const selectStmt = db.prepare(`SELECT ${returnCols} FROM ${tableName} WHERE id = ?`);
            const result = selectStmt.get(params[params.length - 1]);
            return { rows: result ? [result] : [], rowCount: result ? 1 : 0 };
          }
        }
      }
      return { rows: [], rowCount: 0 };
    }
  } catch (error) {
    console.error('SQLite query error:', error);
    throw error;
  }
};

export async function seedSQLiteDatabase() {
  console.log('🌱 Starte SQLite-Datenbank-Seeding...');

  try {
    // Initialisiere Datenbank falls noch nicht geschehen
    await initSQLiteDatabase();
    // Prüfe ob bereits Daten vorhanden sind
    const userCheck = await query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userCheck.rows?.[0]?.count || '0');
    
    if (userCount > 0) {
      console.log('✅ Datenbank bereits mit Daten gefüllt');
      return;
    }

    await query(
      `INSERT INTO roles (name, permissions)
       VALUES 
        ($1, $2),
        ($3, $4),
        ($5, $6),
        ($7, $8)
       ON CONFLICT(name) DO NOTHING`,
      [
        'admin',
        JSON.stringify(['metadata:read', 'metadata:write', 'governance:manage', 'users:manage', 'audit:read', 'pipelines:run', 'feature-store:read', 'feature-store:write', 'feature-store:sync']),
        'operations_lead',
        JSON.stringify(['metadata:read', 'pipelines:run', 'audit:read']),
        'project_manager',
        JSON.stringify(['metadata:read']),
        'employee',
        JSON.stringify([]),
      ]
    );

    // Erstelle Admin-Benutzer
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin@test.com', adminPasswordHash, 'Admin', 'Test', 1]
    );

    // Erstelle weitere Test-Benutzer
    const user1PasswordHash = await bcrypt.hash('user123', 10);
    await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, $3, $4, $5)`,
      ['max.mustermann@test.com', user1PasswordHash, 'Max', 'Mustermann', 3]
    );

    const user2PasswordHash = await bcrypt.hash('user123', 10);
    await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, $3, $4, $5)`,
      ['anna.schmidt@test.com', user2PasswordHash, 'Anna', 'Schmidt', 3]
    );

    // Hole Benutzer-IDs
    const adminResult = await query('SELECT id FROM users WHERE email = $1', ['admin@test.com']);
    const user1Result = await query('SELECT id FROM users WHERE email = $1', ['max.mustermann@test.com']);
    
    const adminId = adminResult.rows?.[0]?.id;
    const userId1 = user1Result.rows?.[0]?.id;

    // Erstelle Test-Unternehmen
    const company1Result =     // Elite PV GmbH - Hauptfirma (aus Hero Software übernommen)
    await query(
      `INSERT INTO companies (name, email, phone, city, address, postal_code, country, website, tax_number, bank_name, iban, bic)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        ELITE_PV_COMPANY.name,
        ELITE_PV_COMPANY.email,
        ELITE_PV_COMPANY.phone,
        ELITE_PV_COMPANY.city,
        ELITE_PV_COMPANY.street,
        ELITE_PV_COMPANY.postal_code,
        'Deutschland',
        ELITE_PV_COMPANY.website,
        ELITE_PV_COMPANY.tax_number,
        ELITE_PV_COMPANY.bank_name,
        ELITE_PV_COMPANY.iban,
        ELITE_PV_COMPANY.bic
      ]
    );
    
    // Beispiel-Kunde
    const company2Result = await query(
      `INSERT INTO companies (name, email, phone, city, address, postal_code)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Mustermann Bau GmbH', 'kontakt@mustermann-bau.de', '0961-12345678', 'Weiden', 'Musterstraße 1', '92637']
    );

    // Hole Unternehmen-IDs
    const company1IdResult = await query('SELECT id FROM companies WHERE name = $1', [ELITE_PV_COMPANY.name]);
    const company2IdResult = await query('SELECT id FROM companies WHERE name = $1', ['Mustermann Bau GmbH']);
    
    const company1Id = company1IdResult.rows?.[0]?.id;
    const company2Id = company2IdResult.rows?.[0]?.id;

    // Erstelle Kontakte (Beispiel-Ansprechpartner)
    await query(
      `INSERT INTO contacts (company_id, first_name, last_name, email, phone, position)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [company1Id, 'Levin', 'Schober', ELITE_PV_COMPANY.email, ELITE_PV_COMPANY.phone, 'Geschäftsführer']
    );

    await query(
      `INSERT INTO contacts (company_id, first_name, last_name, email, phone, position)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [company2Id, 'Sabine', 'Müller', 's.mueller@pv-mueller.de', '089-98765433', 'Projektleitung']
    );

    // Erstelle Test-Projekte
    const project1Result = await query(
      `INSERT INTO projects (name, reference, customer_id, status, start_date, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'PV-Anlage Einfamilienhaus Berlin',
        'PRJ-2024-001',
        company1Id,
        'active',
        '2024-01-15',
        'Installation einer 10kWp Photovoltaikanlage auf Einfamilienhaus',
        adminId
      ]
    );

    const project2Result = await query(
      `INSERT INTO projects (name, reference, customer_id, status, start_date, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'PV-Anlage Gewerbegebäude München',
        'PRJ-2024-002',
        company2Id,
        'planning',
        '2024-02-01',
        'Planung und Installation einer 50kWp Anlage',
        adminId
      ]
    );

    // Hole Projekt-IDs
    const project1IdResult = await query('SELECT id FROM projects WHERE reference = $1', ['PRJ-2024-001']);
    const project1Id = project1IdResult.rows?.[0]?.id;

    // Erstelle Zeit-Einträge
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await query(
      `INSERT INTO time_entries (user_id, project_id, start_time, end_time, break_duration, description, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId1,
        project1Id,
        new Date(yesterday.setHours(8, 0, 0)).toISOString(),
        new Date(yesterday.setHours(17, 0, 0)).toISOString(),
        30,
        'Montage von Solarmodulen',
        'work'
      ]
    );

    await query(
      `INSERT INTO time_entries (user_id, project_id, start_time, end_time, break_duration, description, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId1,
        project1Id,
        new Date(today.setHours(8, 0, 0)).toISOString(),
        new Date(today.setHours(12, 30, 0)).toISOString(),
        0,
        'Verkabelung und Wechselrichter-Anschluss',
        'work'
      ]
    );

    // Erstelle Tickets
    await query(
      `INSERT INTO tickets (title, description, status, priority, assigned_to, created_by, project_id, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'Wechselrichter defekt',
        'Der Wechselrichter zeigt Fehlercode E102',
        'open',
        'high',
        userId1,
        adminId,
        project1Id,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ]
    );

    await query(
      `INSERT INTO tickets (title, description, status, priority, assigned_to, created_by, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'Materialbestellung fehlt',
        'Kabel und Klemmen müssen noch bestellt werden',
        'open',
        'medium',
        userId1,
        adminId,
        project1Id
      ]
    );

    // Erstelle Artikel
    const item1Result = await query(
      `INSERT INTO items (name, sku, description, unit, price, category)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Solarmodul 400W', 'PV-MOD-400W', 'Monokristallines Solarmodul 400Wp', 'Stück', 180.00, 'Module']
    );

    const item2Result = await query(
      `INSERT INTO items (name, sku, description, unit, price, category)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Wechselrichter 10kW', 'PV-WR-10KW', 'String-Wechselrichter 10kW', 'Stück', 1200.00, 'Wechselrichter']
    );

    // Hole Artikel-IDs
    const item1IdResult = await query('SELECT id FROM items WHERE sku = $1', ['PV-MOD-400W']);
    const item1Id = item1IdResult.rows?.[0]?.id;

    // Erstelle Lagerbestand
    await query(
      `INSERT OR REPLACE INTO inventory_stock (item_id, warehouse_id, quantity)
       VALUES ($1, $2, $3)`,
      [item1Id, 1, 50]
    );

    // Erstelle Angebote
    await query(
      `INSERT INTO offers (offer_number, project_id, customer_id, amount, tax_rate, status, valid_until, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'ANG-2024-001',
        project1Id,
        company1Id,
        25000.00,
        19.00,
        'pending',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adminId
      ]
    );

    // Erstelle Rechnungen
    await query(
      `INSERT INTO invoices (invoice_number, project_id, customer_id, amount, tax_rate, status, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'RE-2024-001',
        project1Id,
        company1Id,
        25000.00,
        19.00,
        'pending',
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adminId
      ]
    );

    // PDF-Einstellungen für Angebote (aus Hero Software übernommen)
    await query(
      `INSERT INTO pdf_settings (
        document_type, 
        primary_color, secondary_color,
        font_family, font_size, footer_font_size,
        margin_top, margin_right, margin_bottom, margin_left,
        address_position_x, address_position_y,
        logo_position_x, logo_position_y, logo_width,
        show_sender_line, show_fold_marks,
        intro_text_template, footer_text_template
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        'offer',
        '#1976D2', '#FF9800',
        'Helvetica', 9, 7,
        113, 57, 99, 71,  // Ränder in Punkten (aus Hero: 40mm, 20mm, 35mm, 25mm)
        71, 127,          // Adressblock-Position (25mm, 45mm)
        425, 28, 127,     // Logo-Position (150mm, 10mm, 45mm breit)
        1, 1,             // Absenderzeile und Falzmarken aktiviert
        ELITE_PV_OFFER_TEXTS.intro_text,
        ELITE_PV_OFFER_TEXTS.footer_text
      ]
    );

    // PDF-Einstellungen für Standard (Fallback)
    await query(
      `INSERT INTO pdf_settings (
        document_type, 
        primary_color, secondary_color,
        font_family, font_size, footer_font_size,
        margin_top, margin_right, margin_bottom, margin_left,
        show_sender_line, show_fold_marks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        'default',
        '#1976D2', '#FF9800',
        'Helvetica', 9, 7,
        113, 57, 99, 71,
        1, 1
      ]
    );

    console.log('✅ SQLite-Datenbank-Seeding abgeschlossen!');
    console.log('');
    console.log('📋 Login-Daten:');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   User: max.mustermann@test.com / user123');
    console.log('   User: anna.schmidt@test.com / user123');
    console.log('');
    console.log('📊 Test-Daten:');
    console.log('   - 3 Benutzer');
    console.log('   - 2 Unternehmen');
    console.log('   - 2 Kontakte');
    console.log('   - 2 Projekte');
    console.log('   - 2 Zeit-Einträge');
    console.log('   - 2 Tickets');
    console.log('   - 2 Artikel');
    console.log('   - 1 Angebot');
    console.log('   - 1 Rechnung');
  } catch (error: any) {
    console.error('❌ Fehler beim Seeding:', error.message);
    console.error(error);
    throw error;
  }
}

// Ausführen wenn direkt aufgerufen
if (require.main === module) {
  seedSQLiteDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

