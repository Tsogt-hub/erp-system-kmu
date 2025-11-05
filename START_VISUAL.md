# 👀 System visuell starten - Schritt für Schritt

## 🎯 Schnellstart (3 Terminal-Fenster)

### Terminal 1: Docker starten
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU"
docker-compose -f docker/docker-compose.yml up -d
```
✅ PostgreSQL läuft auf Port 5432  
✅ Redis läuft auf Port 6379

### Terminal 2: Backend starten
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/backend"

# Beim ersten Mal: Abhängigkeiten installieren
npm install

# .env Datei erstellen (wenn noch nicht vorhanden)
cp .env.example .env

# Backend starten
npm run dev
```
✅ Backend läuft auf: **http://localhost:3000**  
✅ Sie sehen: `🚀 Server running on port 3000`

### Terminal 3: Frontend starten
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/frontend"

# Beim ersten Mal: Abhängigkeiten installieren
npm install

# Frontend starten
npm run dev
```
✅ Frontend öffnet automatisch: **http://localhost:5173**

---

## 🌐 Im Browser öffnen

1. **Öffnen Sie**: http://localhost:5173
2. **Sie sehen die Login-Seite**
3. **Erstellen Sie einen Account** (Registrierung über API oder direkt testen)

---

## 📸 Was Sie sehen werden:

### Login-Seite
- Modernes Material-UI Design
- Eingabefelder für E-Mail und Passwort
- "Anmelden" Button

### Dashboard (nach Login)
- **4 Karten mit Statistiken**:
  - Aktive Projekte
  - Heute erfasste Stunden
  - Offene Tickets
  - Anzahl Kunden
- **2 Tabellen**:
  - Ihre Projekte (letzte 5)
  - Ihre Tickets (letzte 5)

### Sidebar-Navigation
- Startseite
- Projekte
- CRM
- Zeiterfassung
- Tickets
- Lagerbestand
- Angebote
- Rechnungen
- Benutzer
- Einstellungen

---

## 🧪 Erste Schritte zum Testen

1. **Projekt erstellen**:
   - Klicken Sie auf "Projekte" → "Neues Projekt"
   - Name: "Test-Projekt"
   - Status: "Aktiv"

2. **Unternehmen hinzufügen**:
   - Klicken Sie auf "CRM" → Tab "Unternehmen"
   - "Neues Unternehmen" → Name: "Test GmbH"

3. **Zeiterfassung starten**:
   - Klicken Sie auf "Zeiterfassung"
   - Klicken Sie auf "Start"
   - Sehen Sie die laufende Zeiterfassung

4. **Ticket erstellen**:
   - Klicken Sie auf "Tickets"
   - "Neues Ticket" → Titel: "Test-Ticket"

5. **Dashboard aktualisieren**:
   - Klicken Sie auf "Startseite"
   - Sehen Sie die aktualisierten Statistiken!

---

## 🔍 Debugging

### Backend läuft nicht?
```bash
cd backend
npm install  # Falls Module fehlen
npm run dev
```

### Frontend läuft nicht?
```bash
cd frontend
npm install  # Falls Module fehlen
npm run dev
```

### Datenbank-Fehler?
```bash
# Prüfen ob Docker läuft
docker ps

# Docker neu starten
docker-compose -f docker/docker-compose.yml restart
```

---

## 📱 Browser-URLs

- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/
- **Projekte**: http://localhost:5173/projects
- **CRM**: http://localhost:5173/crm
- **Zeiterfassung**: http://localhost:5173/time-tracking
- **Tickets**: http://localhost:5173/tickets
- **Lagerbestand**: http://localhost:5173/inventory
- **Angebote**: http://localhost:5173/offers
- **Rechnungen**: http://localhost:5173/invoices
- **Benutzer**: http://localhost:5173/users
- **Einstellungen**: http://localhost:5173/settings

---

## ✨ Viel Erfolg!

Das System ist vollständig funktionsfähig. Sie können jetzt alle Module testen und verwenden!





