# 🚀 Quick Start - System visuell sehen

## Schritt 1: Docker starten (Datenbank)

Öffnen Sie ein Terminal und führen Sie aus:

```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU"
docker-compose -f docker/docker-compose.yml up -d
```

Dies startet PostgreSQL und Redis im Hintergrund.

## Schritt 2: Backend starten

Öffnen Sie ein **neues Terminal-Fenster** und führen Sie aus:

```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/backend"

# Abhängigkeiten installieren (nur beim ersten Mal)
npm install

# .env Datei erstellen (falls noch nicht vorhanden)
cp .env.example .env

# Backend starten
npm run dev
```

Das Backend läuft jetzt auf: **http://localhost:3000**

## Schritt 3: Frontend starten

Öffnen Sie ein **weiteres Terminal-Fenster** und führen Sie aus:

```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/frontend"

# Abhängigkeiten installieren (nur beim ersten Mal)
npm install

# Frontend starten
npm run dev
```

Das Frontend öffnet automatisch im Browser: **http://localhost:5173**

## Schritt 4: Ersten Benutzer erstellen

1. Öffnen Sie http://localhost:5173 im Browser
2. Klicken Sie auf "Registrieren" (oder nutzen Sie die API direkt)
3. Erstellen Sie einen Benutzer
4. Loggen Sie sich ein

## 🎯 Was Sie sehen werden:

- **Login-Seite**: Modernes Material-UI Design
- **Dashboard**: Mit Statistiken und Widgets
- **Sidebar-Navigation**: Alle Module erreichbar
  - Startseite
  - Projekte
  - CRM
  - Zeiterfassung
  - Tickets
  - Lagerbestand
  - Angebote
  - Rechnungen

## 🔧 Troubleshooting

### Port bereits belegt?
- Backend: Ändern Sie `PORT` in `backend/.env`
- Frontend: Ändern Sie `port` in `frontend/vite.config.ts`

### Datenbank-Fehler?
- Prüfen Sie, ob Docker läuft: `docker ps`
- Prüfen Sie die `.env` Datei im Backend-Ordner

### Module nicht gefunden?
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install
```

## 📱 Browser-Ansicht

Nach dem Start sehen Sie:
- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/ (nach Login)

## 🎨 Features zum Testen:

1. **Dashboard**: Zeigt echte Statistiken aus der Datenbank
2. **Projekte**: Erstellen Sie ein neues Projekt
3. **CRM**: Fügen Sie Unternehmen und Kontakte hinzu
4. **Zeiterfassung**: Starten Sie die Zeiterfassung
5. **Tickets**: Erstellen Sie ein Ticket
6. **Lagerbestand**: Fügen Sie Artikel hinzu
7. **Angebote/Rechnungen**: Erstellen Sie Angebote und Rechnungen

Viel Erfolg! 🎉





