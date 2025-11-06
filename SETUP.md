# Setup-Anleitung

## Voraussetzungen

- Node.js 18+ installiert
- Docker Desktop installiert und laufend
- PostgreSQL 14+ (optional, wenn Docker verwendet wird)
- Git

## Installation

### 1. Automatisches Setup (empfohlen)

```bash
./scripts/setup.sh
```

### 2. Manuelles Setup

#### Schritt 1: Docker Services starten

```bash
docker-compose -f docker/docker-compose.yml up -d
```

Dies startet:
- PostgreSQL Datenbank (Port 5432)
- Redis Cache (Port 6379)

#### Schritt 2: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Einstellungen
npm run dev
```

#### Schritt 3: Datenbank initialisieren

Die Datenbank wird automatisch mit dem Schema aus `database/schema.sql` initialisiert, wenn Docker verwendet wird.

Alternativ können Sie das Schema manuell ausführen:

```bash
psql -U postgres -d erp_system_kmu -f ../database/schema.sql
```

#### Schritt 4: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Zugriff

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Erste Schritte

1. **Registrierung**: Erstellen Sie einen neuen Benutzer über die Registrierungsseite
2. **Login**: Melden Sie sich mit Ihren Anmeldedaten an
3. **Projekte**: Erstellen Sie Ihr erstes Projekt

## Entwicklung

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

## Produktion

### Backend bauen
```bash
cd backend
npm run build
npm start
```

### Frontend bauen
```bash
cd frontend
npm run build
```

Die gebauten Dateien befinden sich im `dist` Verzeichnis.

## Fehlerbehebung

### Datenbank-Verbindungsfehler
- Stellen Sie sicher, dass Docker läuft
- Überprüfen Sie die Umgebungsvariablen in `backend/.env`
- Prüfen Sie, ob PostgreSQL läuft: `docker ps`

### Port bereits belegt
- Ändern Sie die Ports in `docker-compose.yml` oder `.env`
- Oder beenden Sie die Prozesse, die die Ports verwenden

### Module nicht gefunden
- Führen Sie `npm install` in beiden Verzeichnissen aus
- Löschen Sie `node_modules` und `package-lock.json` und installieren Sie neu








