import { Pool } from 'pg';
import { config } from '../config/env';
import { logger } from './logger';

export async function initPostgresDatabase() {
  logger.info('🗄️  Initialisiere PostgreSQL-Datenbank...');

  const pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    user: config.db.user,
    password: config.db.password,
    ssl: config.db.ssl || false,
  });

  try {
    // Prüfe ob users-Tabelle mit korrektem Schema existiert (role_id statt role)
    const usersCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role_id'
    `);

    // Prüfe ob roles-Tabelle existiert
    const rolesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'roles'
    `);

    // Wenn roles-Tabelle fehlt oder users-Tabelle role_id nicht hat, Schema neu erstellen
    if (rolesCheck.rows.length === 0 || usersCheck.rows.length === 0) {
      logger.info('📋 Erstelle/Aktualisiere Datenbank-Schema...');
      
      // Lösche alle Tabellen, um neu zu starten (wegen Foreign Key Constraints)
      await pool.query(`
        DROP TABLE IF EXISTS kanban_activities CASCADE;
        DROP TABLE IF EXISTS kanban_cards CASCADE;
        DROP TABLE IF EXISTS kanban_columns CASCADE;
        DROP TABLE IF EXISTS kanban_boards CASCADE;
        DROP TABLE IF EXISTS log_entries CASCADE;
        DROP TABLE IF EXISTS offer_template_items CASCADE;
        DROP TABLE IF EXISTS offer_templates CASCADE;
        DROP TABLE IF EXISTS calendar_events CASCADE;
        DROP TABLE IF EXISTS documents CASCADE;
        DROP TABLE IF EXISTS reminders CASCADE;
        DROP TABLE IF EXISTS inventory CASCADE;
        DROP TABLE IF EXISTS tickets CASCADE;
        DROP TABLE IF EXISTS offer_items CASCADE;
        DROP TABLE IF EXISTS offers CASCADE;
        DROP TABLE IF EXISTS invoices CASCADE;
        DROP TABLE IF EXISTS articles CASCADE;
        DROP TABLE IF EXISTS time_entries CASCADE;
        DROP TABLE IF EXISTS tasks CASCADE;
        DROP TABLE IF EXISTS projects CASCADE;
        DROP TABLE IF EXISTS contacts CASCADE;
        DROP TABLE IF EXISTS companies CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS roles CASCADE;
      `);
      logger.info('🗑️  Alte Tabellen gelöscht');
    }

    // Prüfe ob Tabellen existieren (nach dem optionalen Löschen)
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'roles'
    `);

    if (tablesCheck.rows.length === 0) {
      logger.info('📋 Erstelle Datenbank-Schema...');
      
      // Erstelle alle notwendigen Tabellen
      await pool.query(`
        -- Roles Table (muss vor users erstellt werden)
        CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          permissions TEXT DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Users Table
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role_id INTEGER DEFAULT 3 REFERENCES roles(id),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Companies Table
        CREATE TABLE IF NOT EXISTS companies (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          street VARCHAR(255),
          city VARCHAR(100),
          postal_code VARCHAR(20),
          country VARCHAR(100) DEFAULT 'Deutschland',
          phone VARCHAR(50),
          email VARCHAR(255),
          website VARCHAR(255),
          tax_id VARCHAR(50),
          notes TEXT,
          is_archived BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Contacts Table
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
          type VARCHAR(50) DEFAULT 'person',
          salutation VARCHAR(20),
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          email VARCHAR(255),
          phone VARCHAR(50),
          mobile VARCHAR(50),
          position VARCHAR(100),
          notes TEXT,
          is_primary BOOLEAN DEFAULT false,
          is_archived BOOLEAN DEFAULT false,
          street VARCHAR(255),
          city VARCHAR(100),
          postal_code VARCHAR(20),
          country VARCHAR(100) DEFAULT 'Deutschland',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Projects Table
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          customer_id INTEGER,
          status VARCHAR(50) DEFAULT 'planned',
          priority VARCHAR(20) DEFAULT 'medium',
          start_date DATE,
          end_date DATE,
          budget DECIMAL(12,2),
          pipeline_id VARCHAR(50),
          pipeline_step VARCHAR(50),
          assigned_to INTEGER REFERENCES users(id),
          gewerk VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Time Entries Table
        CREATE TABLE IF NOT EXISTS time_entries (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
          description TEXT,
          hours DECIMAL(5,2) NOT NULL,
          date DATE NOT NULL,
          billable BOOLEAN DEFAULT true,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Articles Table
        CREATE TABLE IF NOT EXISTS articles (
          id SERIAL PRIMARY KEY,
          article_number VARCHAR(50) UNIQUE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          unit VARCHAR(20) DEFAULT 'Stück',
          purchase_price DECIMAL(12,2),
          selling_price DECIMAL(12,2),
          tax_rate DECIMAL(5,2) DEFAULT 19.00,
          stock_quantity INTEGER DEFAULT 0,
          min_stock_level INTEGER DEFAULT 0,
          supplier VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Offers Table
        CREATE TABLE IF NOT EXISTS offers (
          id SERIAL PRIMARY KEY,
          offer_number VARCHAR(50) UNIQUE,
          project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
          customer_id INTEGER,
          title VARCHAR(255),
          description TEXT,
          status VARCHAR(50) DEFAULT 'draft',
          subtotal DECIMAL(12,2),
          tax_amount DECIMAL(12,2),
          total DECIMAL(12,2),
          valid_until DATE,
          notes TEXT,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Offer Items Table
        CREATE TABLE IF NOT EXISTS offer_items (
          id SERIAL PRIMARY KEY,
          offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
          article_id INTEGER REFERENCES articles(id),
          position INTEGER,
          name VARCHAR(255),
          description TEXT,
          quantity DECIMAL(10,2) DEFAULT 1,
          unit VARCHAR(20) DEFAULT 'Stück',
          unit_price DECIMAL(12,2),
          discount DECIMAL(5,2) DEFAULT 0,
          tax_rate DECIMAL(5,2) DEFAULT 19.00,
          total DECIMAL(12,2),
          category VARCHAR(100),
          is_optional BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Invoices Table
        CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          invoice_number VARCHAR(50) UNIQUE,
          offer_id INTEGER REFERENCES offers(id),
          project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
          customer_id INTEGER,
          title VARCHAR(255),
          status VARCHAR(50) DEFAULT 'draft',
          subtotal DECIMAL(12,2),
          tax_amount DECIMAL(12,2),
          total DECIMAL(12,2),
          due_date DATE,
          paid_date DATE,
          notes TEXT,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Tickets Table
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          ticket_number VARCHAR(50) UNIQUE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          priority VARCHAR(20) DEFAULT 'medium',
          status VARCHAR(50) DEFAULT 'open',
          category VARCHAR(100),
          project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
          assigned_to INTEGER REFERENCES users(id),
          created_by INTEGER REFERENCES users(id),
          due_date DATE,
          resolved_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Inventory Table
        CREATE TABLE IF NOT EXISTS inventory (
          id SERIAL PRIMARY KEY,
          article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
          warehouse_location VARCHAR(100),
          quantity INTEGER DEFAULT 0,
          reserved_quantity INTEGER DEFAULT 0,
          last_counted DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Tasks Table
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          priority VARCHAR(20) DEFAULT 'medium',
          due_date DATE,
          project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
          assigned_to INTEGER REFERENCES users(id),
          created_by INTEGER REFERENCES users(id),
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Kanban Boards Table
        CREATE TABLE IF NOT EXISTS kanban_boards (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          board_type VARCHAR(50) DEFAULT 'custom',
          created_by INTEGER REFERENCES users(id),
          is_active BOOLEAN DEFAULT true,
          is_default BOOLEAN DEFAULT false,
          settings TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Kanban Columns Table
        CREATE TABLE IF NOT EXISTS kanban_columns (
          id SERIAL PRIMARY KEY,
          board_id INTEGER REFERENCES kanban_boards(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          position INTEGER DEFAULT 0,
          color VARCHAR(50) DEFAULT '#64B5F6',
          is_default BOOLEAN DEFAULT false,
          wip_limit INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Kanban Cards Table
        CREATE TABLE IF NOT EXISTS kanban_cards (
          id SERIAL PRIMARY KEY,
          column_id INTEGER REFERENCES kanban_columns(id) ON DELETE CASCADE,
          board_id INTEGER REFERENCES kanban_boards(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          position INTEGER DEFAULT 0,
          priority VARCHAR(20) DEFAULT 'medium',
          due_date DATE,
          amount DECIMAL(12,2),
          assigned_to INTEGER REFERENCES users(id),
          contact_id INTEGER REFERENCES contacts(id),
          company_id INTEGER REFERENCES companies(id),
          labels TEXT,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Kanban Activities Table
        CREATE TABLE IF NOT EXISTS kanban_activities (
          id SERIAL PRIMARY KEY,
          card_id INTEGER REFERENCES kanban_cards(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id),
          activity_type VARCHAR(50) NOT NULL,
          content TEXT,
          old_value TEXT,
          new_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Reminders Table
        CREATE TABLE IF NOT EXISTS reminders (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          remind_at TIMESTAMP NOT NULL,
          entity_type VARCHAR(50),
          entity_id INTEGER,
          user_id INTEGER REFERENCES users(id),
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Documents Table
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500),
          file_type VARCHAR(50),
          file_size INTEGER,
          entity_type VARCHAR(50),
          entity_id INTEGER,
          uploaded_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Calendar Events Table
        CREATE TABLE IF NOT EXISTS calendar_events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP NOT NULL,
          all_day BOOLEAN DEFAULT false,
          location VARCHAR(255),
          project_id INTEGER REFERENCES projects(id),
          user_id INTEGER REFERENCES users(id),
          attendees TEXT,
          color VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Offer Templates Table
        CREATE TABLE IF NOT EXISTS offer_templates (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Offer Template Items Table
        CREATE TABLE IF NOT EXISTS offer_template_items (
          id SERIAL PRIMARY KEY,
          template_id INTEGER REFERENCES offer_templates(id) ON DELETE CASCADE,
          article_id INTEGER REFERENCES articles(id),
          position INTEGER,
          name VARCHAR(255),
          description TEXT,
          quantity DECIMAL(10,2) DEFAULT 1,
          unit VARCHAR(20) DEFAULT 'Stück',
          unit_price DECIMAL(12,2),
          discount DECIMAL(5,2) DEFAULT 0,
          tax_rate DECIMAL(5,2) DEFAULT 19.00,
          category VARCHAR(100),
          is_optional BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Log Entries Table
        CREATE TABLE IF NOT EXISTS log_entries (
          id SERIAL PRIMARY KEY,
          entity_type VARCHAR(50) NOT NULL,
          entity_id INTEGER NOT NULL,
          action VARCHAR(50) NOT NULL,
          description TEXT,
          user_id INTEGER REFERENCES users(id),
          user_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Notifications Table
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          related_id INTEGER,
          related_type VARCHAR(50),
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Project Members Table
        CREATE TABLE IF NOT EXISTS project_members (
          id SERIAL PRIMARY KEY,
          project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          role VARCHAR(50) DEFAULT 'member',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(project_id, user_id)
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
        CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
        CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
        CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
        CREATE INDEX IF NOT EXISTS idx_offers_project ON offers(project_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_project ON tickets(project_id);
        CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON kanban_cards(column_id);
        CREATE INDEX IF NOT EXISTS idx_kanban_columns_board ON kanban_columns(board_id);
        CREATE INDEX IF NOT EXISTS idx_kanban_activities_card ON kanban_activities(card_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
        CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
        CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
      `);

      // Erstelle Standardrollen
      await pool.query(`
        INSERT INTO roles (id, name, permissions) VALUES 
          (1, 'admin', '["*"]'),
          (2, 'manager', '["read:*", "write:*"]'),
          (3, 'employee', '["read:own", "write:own"]')
        ON CONFLICT (name) DO NOTHING;
      `);

      logger.info('✅ PostgreSQL-Schema erstellt');
    } else {
      logger.info('✅ PostgreSQL-Tabellen existieren bereits');
    }

    // Run migrations to add missing columns
    await runMigrations(pool);

    await pool.end();
    return true;
  } catch (error: any) {
    logger.error('❌ PostgreSQL-Initialisierung fehlgeschlagen:', error.message);
    await pool.end();
    throw error;
  }
}

async function runMigrations(pool: Pool) {
  logger.info('🔄 Führe Migrationen aus...');

  // Erstelle notifications Tabelle falls nicht vorhanden
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_id INTEGER,
        related_type VARCHAR(50),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
    `);
    logger.info('✅ notifications Tabelle erstellt/geprüft');
  } catch (e) {
    logger.warn('notifications migration warning:', e);
  }

  // Erstelle project_members Tabelle falls nicht vorhanden
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
    `);
    logger.info('✅ project_members Tabelle erstellt/geprüft');
  } catch (e) {
    logger.warn('project_members migration warning:', e);
  }

  // Erstelle tasks Tabelle falls nicht vorhanden (zusätzlich zu init)
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(20) DEFAULT 'medium',
        due_date DATE,
        assigned_to INTEGER REFERENCES users(id),
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info('✅ tasks Tabelle erstellt/geprüft');
  } catch (e) {
    logger.warn('tasks migration warning:', e);
  }

  // Add missing columns to kanban_boards if they don't exist
  try {
    await pool.query(`
      ALTER TABLE kanban_boards ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
      ALTER TABLE kanban_boards ADD COLUMN IF NOT EXISTS settings TEXT;
    `);
  } catch (e) {
    // Column might already exist
  }

  // Add missing columns to kanban_columns if they don't exist
  try {
    await pool.query(`
      ALTER TABLE kanban_columns ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
      ALTER TABLE kanban_columns ADD COLUMN IF NOT EXISTS wip_limit INTEGER;
    `);
  } catch (e) {
    // Column might already exist
  }

  // Add missing columns to kanban_cards if they don't exist
  try {
    await pool.query(`
      ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS labels TEXT;
      ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS board_id INTEGER REFERENCES kanban_boards(id) ON DELETE CASCADE;
    `);
    
    // Update board_id for existing cards based on their column's board
    await pool.query(`
      UPDATE kanban_cards c
      SET board_id = col.board_id
      FROM kanban_columns col
      WHERE c.column_id = col.id AND c.board_id IS NULL;
    `);
  } catch (e) {
    // Column might already exist or query failed
    logger.warn('kanban_cards migration warning:', e);
  }

  logger.info('✅ Migrationen abgeschlossen');
}

