# ERP-System für Photovoltaik-Handwerksbetriebe

Ein umfassendes ERP-System speziell für Photovoltaik-Handwerksbetriebe, entwickelt mit modernen Web-Technologien.

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+
- Docker Desktop
- Git

### Installation

1. **Repository klonen oder Projekt verwenden**
```bash
cd "ERP System KMU"
```

2. **Setup-Script ausführen**
```bash
./scripts/setup.sh
```

3. **Backend starten**
```bash
cd backend
npm run dev
```

4. **Frontend starten** (in neuem Terminal)
```bash
cd frontend
npm run dev
```

5. **System öffnen**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📋 Features

### ✅ Implementiert (MVP)

- ✅ **Authentifizierung**: Registrierung, Login, JWT-basierte Authentifizierung
- ✅ **Dashboard**: Übersicht mit Widgets und Statistiken
- ✅ **Projektmanagement**: CRUD-Operationen für Projekte
- ✅ **Benutzerverwaltung**: Rollen und Berechtigungen
- ✅ **Responsive Design**: Material-UI basiertes, modernes Interface

### 🚧 In Entwicklung

- 🚧 CRM (Kontakte, Unternehmen)
- 🚧 Zeiterfassung (Echtzeit-Tracking)
- 🚧 Ticket-System
- 🚧 Lagerbestand & Materialwirtschaft
- 🚧 Angebote & Rechnungen
- 🚧 PV-Designer (Modul-Planung)
- 🚧 Kalender & Planung
- 🚧 Automatisierung

## 🏗️ Technologie-Stack

### Frontend
- React 18 + TypeScript
- Material-UI (MUI)
- Redux Toolkit
- React Router
- Vite

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT Authentication
- Winston (Logging)

### DevOps
- Docker & Docker Compose
- PostgreSQL 15
- Redis (optional)

## 📁 Projektstruktur

```
ERP System KMU/
├── backend/          # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── package.json
├── frontend/         # Frontend React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── package.json
├── database/         # Datenbank-Schema
├── docker/           # Docker-Konfiguration
└── scripts/          # Setup-Scripts
```

## 🔧 Konfiguration

### Backend Umgebungsvariablen

Kopieren Sie `backend/.env.example` zu `backend/.env` und passen Sie die Werte an:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_system_kmu
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

## 📚 API-Endpunkte

### Authentifizierung
- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Anmelden
- `GET /api/auth/me` - Aktuellen Benutzer abrufen

### Projekte
- `GET /api/projects` - Alle Projekte abrufen
- `GET /api/projects/:id` - Projekt abrufen
- `POST /api/projects` - Projekt erstellen
- `PUT /api/projects/:id` - Projekt aktualisieren
- `DELETE /api/projects/:id` - Projekt löschen

## 🗄️ Datenbank

Das Datenbank-Schema wird automatisch beim ersten Start von Docker initialisiert. Die SQL-Datei befindet sich in `database/schema.sql`.

### Haupttabellen
- `users` - Benutzer
- `roles` - Rollen und Berechtigungen
- `projects` - Projekte
- `companies` - Unternehmen (CRM)
- `contacts` - Kontakte
- `time_entries` - Zeiteinträge
- `tickets` - Tickets
- `items` - Artikel
- `inventory_stock` - Lagerbestand
- `pv_designs` - PV-Designs

## 🧪 Entwicklung

### Backend starten
```bash
cd backend
npm run dev
```

### Frontend starten
```bash
cd frontend
npm run dev
```

### Datenbank-Migrationen
```bash
cd backend
npm run migrate
```

## 📖 Dokumentation

- [Setup-Anleitung](SETUP.md)
- [Architektur-Dokumentation](ARCHITECTURE.md)
- [Projektstruktur](PROJECT_STRUCTURE.md)

## 🐛 Fehlerbehebung

### Datenbank-Verbindungsfehler
- Stellen Sie sicher, dass Docker läuft
- Prüfen Sie die Umgebungsvariablen in `backend/.env`
- Überprüfen Sie, ob PostgreSQL läuft: `docker ps`

### Port bereits belegt
- Ändern Sie die Ports in `docker-compose.yml` oder `.env`
- Oder beenden Sie die Prozesse, die die Ports verwenden

## 📝 Lizenz

Dieses Projekt ist für den internen Gebrauch bestimmt.

## 👥 Beitragende

Entwickelt für Photovoltaik-Handwerksbetriebe.

## 🔮 Nächste Schritte

1. CRM-Modul implementieren
2. Zeiterfassung mit Echtzeit-Tracking
3. Ticket-System vollständig umsetzen
4. Lagerbestand-Modul
5. PV-Designer für Modul-Planung
6. Angebote & Rechnungen mit PDF-Export

---

**Status**: MVP (Minimum Viable Product) - Grundfunktionalitäten implementiert
