# System-Architektur

## Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/Vue)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Projekte    │  │    CRM       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PV-Designer │  │  Lager       │  │  Zeiterfass. │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
                    REST API / GraphQL
                          │
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js/Python)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth        │  │  Business    │  │   Services   │      │
│  │  Service     │  │  Logic       │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│  PostgreSQL   │ │     Redis     │ │  File Storage │
│   (Haupt-DB)  │ │    (Cache)    │ │   (S3/Local)  │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Komponenten-Diagramm

### Frontend-Komponenten

```
src/
├── components/
│   ├── common/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── DataTable.tsx
│   │   └── Calendar.tsx
│   ├── dashboard/
│   │   ├── DashboardWidget.tsx
│   │   ├── TimeTrackingWidget.tsx
│   │   ├── TicketsWidget.tsx
│   │   └── ProjectsWidget.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   ├── ProjectDetail.tsx
│   │   └── ProjectForm.tsx
│   ├── crm/
│   │   ├── ContactList.tsx
│   │   ├── CompanyList.tsx
│   │   └── InteractionHistory.tsx
│   ├── pv-designer/
│   │   ├── PVDesignCanvas.tsx
│   │   ├── ModulePlacer.tsx
│   │   └── PerformanceCalculator.tsx
│   ├── inventory/
│   │   ├── ItemList.tsx
│   │   ├── WarehouseManagement.tsx
│   │   └── InventoryMovements.tsx
│   └── time-tracking/
│       ├── TimeTracker.tsx
│       └── TimeEntryForm.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── storage.ts
├── store/
│   ├── authSlice.ts
│   ├── projectSlice.ts
│   └── userSlice.ts
└── utils/
    ├── formatters.ts
    └── validators.ts
```

### Backend-Struktur

```
backend/
├── src/
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── ProjectController.ts
│   │   ├── CRMController.ts
│   │   └── InventoryController.ts
│   ├── services/
│   │   ├── AuthService.ts
│   │   ├── ProjectService.ts
│   │   ├── PDFService.ts
│   │   └── EmailService.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   ├── Contact.ts
│   │   └── Item.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   └── crm.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   └── utils/
│       ├── database.ts
│       └── logger.ts
└── migrations/
    ├── 001_create_users.sql
    ├── 002_create_projects.sql
    └── 003_create_inventory.sql
```

## Datenbank-Schema (Hauptentitäten)

### Kernentitäten

```sql
-- Benutzer & Authentifizierung
Users
  - id (PK)
  - email
  - password_hash
  - first_name
  - last_name
  - role_id (FK)
  - created_at
  - updated_at

Roles
  - id (PK)
  - name
  - permissions (JSON)

-- Projekte
Projects
  - id (PK)
  - name
  - customer_id (FK)
  - status
  - start_date
  - end_date
  - created_at

ProjectMembers
  - id (PK)
  - project_id (FK)
  - user_id (FK)
  - role

-- CRM
Contacts
  - id (PK)
  - first_name
  - last_name
  - email
  - phone
  - company_id (FK)

Companies
  - id (PK)
  - name
  - address
  - tax_id

-- Finanzen
Offers
  - id (PK)
  - project_id (FK)
  - offer_number
  - amount
  - status
  - valid_until

Invoices
  - id (PK)
  - project_id (FK)
  - invoice_number
  - amount
  - status
  - due_date

-- Zeiterfassung
TimeEntries
  - id (PK)
  - user_id (FK)
  - project_id (FK)
  - start_time
  - end_time
  - break_duration
  - description

-- Tickets
Tickets
  - id (PK)
  - title
  - description
  - status
  - priority
  - assigned_to (FK)
  - due_date
  - created_at

-- Lagerbestand
Items
  - id (PK)
  - name
  - sku
  - description
  - unit
  - price

Warehouses
  - id (PK)
  - name
  - address

InventoryMovements
  - id (PK)
  - item_id (FK)
  - warehouse_id (FK)
  - quantity
  - movement_type (IN/OUT)
  - date

-- PV-spezifisch
PVDesigns
  - id (PK)
  - project_id (FK)
  - roof_area
  - module_count
  - expected_output
  - design_data (JSON)
```

## API-Endpunkte (Beispiele)

### Authentifizierung
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Projekte
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/timeline
```

### CRM
```
GET    /api/contacts
POST   /api/contacts
GET    /api/companies
POST   /api/companies
```

### Zeiterfassung
```
GET    /api/time-entries
POST   /api/time-entries
PUT    /api/time-entries/:id
POST   /api/time-entries/start
POST   /api/time-entries/stop
```

### Lagerbestand
```
GET    /api/items
POST   /api/items
GET    /api/inventory
POST   /api/inventory/movements
```

### PV-Designer
```
POST   /api/pv-designs
GET    /api/pv-designs/:id
PUT    /api/pv-designs/:id
POST   /api/pv-designs/:id/calculate
```

## Sicherheitsarchitektur

### Authentifizierung Flow
```
1. User sendet Login-Credentials
2. Backend validiert und generiert JWT
3. Frontend speichert JWT (HttpOnly Cookie oder LocalStorage)
4. Jede API-Anfrage enthält JWT im Header
5. Backend validiert JWT bei jeder Anfrage
```

### Berechtigungsstruktur
```
Roles:
  - Admin: Vollzugriff
  - Manager: Projekte, CRM, Lager
  - Mitarbeiter: Eigene Projekte, Zeiterfassung
  - Kunde: Nur Customer Portal (optional)
```

## Deployment-Architektur

### Entwicklung
```
Docker Compose:
  - Frontend (Dev Server)
  - Backend (Node.js)
  - PostgreSQL
  - Redis (optional)
```

### Produktion
```
Cloud Infrastructure:
  - Load Balancer
  - Frontend (CDN/Static Hosting)
  - Backend (Container/Kubernetes)
  - Database (Managed PostgreSQL)
  - Redis (Managed Cache)
  - File Storage (S3/Blob Storage)
  - Backup Service
```

## Performance-Strategien

1. **Caching**: Redis für häufig abgerufene Daten
2. **Pagination**: Alle Listen paginiert
3. **Lazy Loading**: Bilder und große Datenmengen
4. **Database Indexing**: Indizes auf häufig abgefragten Feldern
5. **CDN**: Statische Assets über CDN
6. **API Rate Limiting**: Schutz vor Überlastung

## Monitoring & Logging

- **Application Logs**: Strukturierte Logs (Winston, Pino)
- **Error Tracking**: Sentry für Fehlerbehandlung
- **Performance Monitoring**: APM-Tools
- **Database Monitoring**: Query-Performance-Tracking
- **User Analytics**: Nutzungsstatistiken (optional)

