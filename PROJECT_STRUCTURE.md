# Projektstruktur-Vorlage

## Empfohlene Verzeichnisstruktur

```
erp-system-kmu/
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Button.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── TimeTrackingWidget.tsx
│   │   │   │   ├── TicketsWidget.tsx
│   │   │   │   └── ProjectsWidget.tsx
│   │   │   ├── projects/
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectDetail.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   └── ProjectCard.tsx
│   │   │   ├── crm/
│   │   │   │   ├── ContactList.tsx
│   │   │   │   ├── ContactForm.tsx
│   │   │   │   ├── CompanyList.tsx
│   │   │   │   └── CompanyForm.tsx
│   │   │   ├── inventory/
│   │   │   │   ├── ItemList.tsx
│   │   │   │   ├── ItemForm.tsx
│   │   │   │   ├── WarehouseManagement.tsx
│   │   │   │   └── InventoryMovements.tsx
│   │   │   ├── time-tracking/
│   │   │   │   ├── TimeTracker.tsx
│   │   │   │   ├── TimeEntryList.tsx
│   │   │   │   └── TimeEntryForm.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── TicketList.tsx
│   │   │   │   ├── TicketDetail.tsx
│   │   │   │   └── TicketForm.tsx
│   │   │   ├── pv-designer/
│   │   │   │   ├── PVDesigner.tsx
│   │   │   │   ├── DesignCanvas.tsx
│   │   │   │   ├── ModulePlacer.tsx
│   │   │   │   └── PerformanceCalculator.tsx
│   │   │   ├── invoices/
│   │   │   │   ├── InvoiceList.tsx
│   │   │   │   ├── InvoiceForm.tsx
│   │   │   │   └── InvoicePreview.tsx
│   │   │   └── offers/
│   │   │       ├── OfferList.tsx
│   │   │       ├── OfferForm.tsx
│   │   │       └── OfferPreview.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── CRM.tsx
│   │   │   ├── Inventory.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── projects.ts
│   │   │   │   ├── crm.ts
│   │   │   │   ├── inventory.ts
│   │   │   │   └── timeTracking.ts
│   │   │   └── storage.ts
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── projectSlice.ts
│   │   │   │   ├── userSlice.ts
│   │   │   │   └── uiSlice.ts
│   │   │   └── store.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProjects.ts
│   │   │   └── useTimeTracking.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── types/
│   │   │   ├── project.ts
│   │   │   ├── user.ts
│   │   │   └── invoice.ts
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   └── theme.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts (oder webpack.config.js)
│   └── .env
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── crm.controller.ts
│   │   │   ├── inventory.controller.ts
│   │   │   ├── timeTracking.controller.ts
│   │   │   ├── ticket.controller.ts
│   │   │   ├── invoice.controller.ts
│   │   │   └── pvDesign.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── project.service.ts
│   │   │   ├── crm.service.ts
│   │   │   ├── inventory.service.ts
│   │   │   ├── pdf.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── pvCalculation.service.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Project.ts
│   │   │   ├── Contact.ts
│   │   │   ├── Company.ts
│   │   │   ├── Item.ts
│   │   │   ├── Invoice.ts
│   │   │   ├── TimeEntry.ts
│   │   │   └── Ticket.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── projects.routes.ts
│   │   │   ├── crm.routes.ts
│   │   │   ├── inventory.routes.ts
│   │   │   └── timeTracking.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rateLimiter.middleware.ts
│   │   ├── utils/
│   │   │   ├── database.ts
│   │   │   ├── logger.ts
│   │   │   ├── jwt.ts
│   │   │   └── validators.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── env.ts
│   │   └── app.ts
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_projects.sql
│   │   ├── 003_create_crm.sql
│   │   ├── 004_create_inventory.sql
│   │   └── 005_create_pv_designs.sql
│   ├── seeds/
│   │   ├── roles.seed.ts
│   │   └── users.seed.ts
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── database/
│   ├── schema.sql
│   ├── seeds.sql
│   └── migrations/
│
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── docs/
│   ├── api/
│   │   └── api-documentation.md
│   ├── user-guide/
│   └── development/
│
├── scripts/
│   ├── setup.sh
│   ├── migrate.sh
│   └── deploy.sh
│
├── .gitignore
├── README.md
├── ARCHITECTURE.md
└── package.json (root)
```

## Technologie-Stack Details

### Frontend (React + TypeScript)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.0",
    "axios": "^1.3.0",
    "@mui/material": "^5.11.0",
    "@mui/icons-material": "^5.11.0",
    "react-hook-form": "^7.43.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.5.0",
    "fullcalendar": "^6.1.0"
  }
}
```

### Backend (Node.js + Express + TypeScript)
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^4.9.0",
    "pg": "^8.9.0",
    "redis": "^4.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "joi": "^17.7.0",
    "pdfkit": "^0.13.0",
    "nodemailer": "^6.9.0",
    "multer": "^1.4.5",
    "winston": "^3.8.0"
  }
}
```

## Entwicklungsumgebung Setup

### Voraussetzungen
- Node.js 18+
- PostgreSQL 14+
- Redis (optional)
- Git

### Installation
```bash
# Repository klonen
git clone <repository-url>
cd erp-system-kmu

# Frontend Setup
cd frontend
npm install
npm run dev

# Backend Setup
cd ../backend
npm install
npm run dev

# Datenbank Setup
createdb erp_system_kmu
npm run migrate
```

## Entwicklungsworkflow

1. Feature Branch erstellen
2. Entwicklung
3. Tests schreiben
4. Code Review
5. Merge in main
6. Deployment

