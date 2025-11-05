import { db } from '../config/database.sqlite';
import fs from 'fs';
import path from 'path';

export async function initSQLiteDatabase() {
  console.log('🗄️  Initialisiere SQLite-Datenbank...');

  try {
    // Prüfe ob Tabellen existieren
    const tablesCheck = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).get();

    if (tablesCheck) {
      console.log('✅ Datenbank-Tabellen existieren bereits');
      return true;
    }

    console.log('📋 Erstelle Datenbank-Schema...');

    // Erstelle Tabellen
    db.exec(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        permissions TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role_id INTEGER DEFAULT 3,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      );

      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT,
        phone TEXT,
        email TEXT,
        tax_id TEXT,
        website TEXT,
        notes TEXT,
        category TEXT DEFAULT 'customer',
        type TEXT DEFAULT 'company',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        mobile TEXT,
        position TEXT,
        notes TEXT,
        category TEXT DEFAULT 'contact',
        type TEXT DEFAULT 'person',
        is_archived INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reference TEXT UNIQUE,
        customer_id INTEGER,
        status TEXT DEFAULT 'draft',
        project_type TEXT DEFAULT 'general',
        pipeline_step TEXT DEFAULT 'new_contact',
        source TEXT,
        start_date DATE,
        end_date DATE,
        description TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES companies(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS project_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'member',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(project_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS time_entries (
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
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'open',
        priority TEXT DEFAULT 'medium',
        assigned_to INTEGER,
        created_by INTEGER NOT NULL,
        due_date DATE,
        project_id INTEGER,
        is_completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (project_id) REFERENCES projects(id)
      );

      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        description TEXT,
        unit TEXT DEFAULT 'Stück',
        price REAL DEFAULT 0,
        category TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS warehouses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        warehouse_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        movement_type TEXT NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
        reference TEXT,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id),
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS inventory_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        warehouse_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(item_id, warehouse_id),
        FOREIGN KEY (item_id) REFERENCES items(id),
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
      );

      CREATE TABLE IF NOT EXISTS offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        offer_number TEXT UNIQUE NOT NULL,
        project_id INTEGER,
        customer_id INTEGER,
        amount REAL NOT NULL,
        tax_rate REAL DEFAULT 19.00,
        status TEXT DEFAULT 'draft',
        valid_until DATE,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (customer_id) REFERENCES companies(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS offer_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        offer_id INTEGER NOT NULL,
        item_id INTEGER,
        description TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT DEFAULT 'Stück',
        unit_price REAL NOT NULL,
        discount_percent REAL DEFAULT 0,
        tax_rate REAL DEFAULT 19.00,
        position_order INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id)
      );

      CREATE INDEX IF NOT EXISTS idx_offer_items_offer ON offer_items(offer_id);
      CREATE INDEX IF NOT EXISTS idx_offer_items_item ON offer_items(item_id);

      CREATE TABLE IF NOT EXISTS offer_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        offer_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        position_order INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_offer_texts_offer ON offer_texts(offer_id);

      CREATE TABLE IF NOT EXISTS offer_titles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        offer_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        position_order INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_offer_titles_offer ON offer_titles(offer_id);

      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        invoice_date DATE NOT NULL,
        due_date DATE NOT NULL,
        contact_id INTEGER NOT NULL,
        company_id INTEGER,
        offer_id INTEGER,
        status TEXT DEFAULT 'draft',
        subtotal REAL NOT NULL,
        tax_rate REAL DEFAULT 19.00,
        tax_amount REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        paid_amount REAL DEFAULT 0,
        currency TEXT DEFAULT 'EUR',
        payment_terms TEXT,
        notes TEXT,
        footer_text TEXT,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id),
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (offer_id) REFERENCES offers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        item_type TEXT NOT NULL,
        item_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        quantity REAL NOT NULL,
        unit TEXT DEFAULT 'Stück',
        unit_price REAL NOT NULL,
        discount_percent REAL DEFAULT 0,
        tax_rate REAL DEFAULT 19.00,
        total_price REAL NOT NULL,
        position INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

      CREATE TABLE IF NOT EXISTS pv_designs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        roof_area REAL,
        module_count INTEGER,
        module_type TEXT,
        expected_output REAL,
        design_data TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        related_id INTEGER,
        related_type TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS calendar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        resource_id INTEGER NOT NULL,
        resource_type TEXT NOT NULL,
        project_id INTEGER,
        recurrence_rule TEXT,
        color TEXT,
        status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
        priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        travel_time INTEGER DEFAULT 0,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS calendar_event_employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(event_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_calendar_events_resource ON calendar_events(resource_id, resource_type);
      CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON calendar_events(start_time, end_time);
      CREATE INDEX IF NOT EXISTS idx_calendar_events_project ON calendar_events(project_id);
      CREATE INDEX IF NOT EXISTS idx_calendar_event_employees_event ON calendar_event_employees(event_id);
      CREATE INDEX IF NOT EXISTS idx_calendar_event_employees_user ON calendar_event_employees(user_id);

      -- Sales Orders (Verkaufsaufträge)
      CREATE TABLE IF NOT EXISTS sales_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        order_date DATE NOT NULL,
        delivery_date DATE,
        contact_id INTEGER NOT NULL,
        company_id INTEGER,
        offer_id INTEGER,
        project_id INTEGER,
        status TEXT DEFAULT 'draft',
        subtotal REAL NOT NULL,
        tax_rate REAL DEFAULT 19.00,
        tax_amount REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        payment_status TEXT DEFAULT 'unpaid',
        delivery_address TEXT,
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id),
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (offer_id) REFERENCES offers(id),
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS sales_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        item_type TEXT NOT NULL,
        item_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        quantity REAL NOT NULL,
        unit TEXT DEFAULT 'Stück',
        unit_price REAL NOT NULL,
        discount_percent REAL DEFAULT 0,
        tax_rate REAL DEFAULT 19.00,
        total_price REAL NOT NULL,
        delivered_quantity REAL DEFAULT 0,
        position INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sales_order_items_order ON sales_order_items(order_id);

      -- Purchase Orders (Einkaufsbestellungen)
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        order_date DATE NOT NULL,
        expected_delivery_date DATE,
        supplier_id INTEGER NOT NULL,
        status TEXT DEFAULT 'draft',
        subtotal REAL NOT NULL,
        tax_rate REAL DEFAULT 19.00,
        tax_amount REAL NOT NULL,
        total_amount REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        payment_terms TEXT,
        delivery_address TEXT,
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES companies(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- Timesheets (Zeiterfassung)
      CREATE TABLE IF NOT EXISTS timesheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        project_id INTEGER,
        task_id INTEGER,
        date DATE NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        hours REAL NOT NULL,
        description TEXT,
        billable INTEGER DEFAULT 1,
        hourly_rate REAL,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (project_id) REFERENCES projects(id)
      );

      CREATE INDEX IF NOT EXISTS idx_timesheets_user ON timesheets(user_id);
      CREATE INDEX IF NOT EXISTS idx_timesheets_project ON timesheets(project_id);
      CREATE INDEX IF NOT EXISTS idx_timesheets_date ON timesheets(date);

      -- Assets (Anlagenverwaltung)
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_number TEXT UNIQUE NOT NULL,
        asset_name TEXT NOT NULL,
        asset_category TEXT NOT NULL,
        purchase_date DATE NOT NULL,
        purchase_price REAL NOT NULL,
        current_value REAL NOT NULL,
        depreciation_method TEXT DEFAULT 'linear',
        depreciation_rate REAL DEFAULT 0,
        useful_life_years INTEGER DEFAULT 5,
        location TEXT,
        assigned_to INTEGER,
        status TEXT DEFAULT 'available',
        manufacturer TEXT,
        model TEXT,
        serial_number TEXT,
        warranty_expiry DATE,
        last_maintenance_date DATE,
        next_maintenance_date DATE,
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(asset_category);
      CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
      CREATE INDEX IF NOT EXISTS idx_assets_assigned ON assets(assigned_to);

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
      CREATE INDEX IF NOT EXISTS idx_projects_pipeline_step ON projects(pipeline_step);
      CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_inventory_stock_item ON inventory_stock(item_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_stock_warehouse ON inventory_stock(warehouse_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
    `);

    // Insert default roles
    db.prepare(`
      INSERT OR IGNORE INTO roles (id, name, permissions) VALUES
      (1, 'admin', '{"all": true}'),
      (2, 'manager', '{"projects": true, "crm": true, "inventory": true}'),
      (3, 'employee', '{"projects": true, "time_tracking": true}'),
      (4, 'customer', '{"portal": true}')
    `).run();

    // Insert default warehouse
    db.prepare(`
      INSERT OR IGNORE INTO warehouses (id, name, address) VALUES
      (1, 'Hauptlager', 'Standard-Lagerort')
    `).run();

    console.log('✅ SQLite-Datenbank initialisiert!');
    
    // Seeding wird separat ausgeführt
    
    return true;
  } catch (error: any) {
    console.error('❌ Fehler bei Datenbank-Initialisierung:', error.message);
    throw error;
  }
}

