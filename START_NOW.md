# 🚀 System jetzt starten - Schnellstart

## ✅ Automatischer Start

Führen Sie einfach aus:

```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU"
./START_SYSTEM.sh
```

Dieses Script:
- ✅ Prüft ob Backend/Frontend laufen
- ✅ Startet sie falls nötig
- ✅ Prüft Datenbank-Verbindung
- ✅ Erstellt Test-Benutzer
- ✅ Zeigt alle wichtigen Informationen

## 📋 Manueller Start (3 Terminal-Fenster)

### Terminal 1: Backend
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/backend"
npm run dev
```

### Terminal 2: Frontend
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/frontend"
npm run dev
```

### Terminal 3: Test-Benutzer erstellen
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU"
./scripts/create-test-user.sh
```

## 🌐 System öffnen

**Öffnen Sie in Ihrem Browser:**
```
http://localhost:5173
```

## 🔑 Login

**Test-Benutzer:**
- E-Mail: `admin@test.com`
- Passwort: `admin123`

**Oder registrieren Sie sich:**
- Klicken Sie auf "Registrieren"
- Füllen Sie das Formular aus
- Sie werden automatisch eingeloggt

## ✅ Was Sie sehen werden:

### 1. Login-Seite
- Modernes Design
- E-Mail und Passwort Felder
- Link zur Registrierung

### 2. Dashboard (nach Login)
- **4 KPI-Karten**:
  - Aktive Projekte
  - Heute erfasste Stunden
  - Offene Tickets
  - Anzahl Kunden
- **2 Tabellen**:
  - Ihre Projekte (letzte 5)
  - Ihre Tickets (letzte 5)

### 3. Sidebar-Navigation (10 Module)
1. **Startseite** - Dashboard
2. **Projekte** - Projektverwaltung mit Detail-Seiten
3. **CRM** - Unternehmen & Kontakte
4. **Zeiterfassung** - Echtzeit-Tracking
5. **Tickets** - Ticket-System
6. **Lagerbestand** - Artikel & Bestand
7. **Angebote** - Angebotsverwaltung
8. **Rechnungen** - Rechnungsverwaltung
9. **Benutzer** - Benutzerverwaltung
10. **Einstellungen** - System-Einstellungen

## 🎯 Erste Schritte zum Testen:

1. **Projekt erstellen**:
   - Dashboard → Projekte → "Neues Projekt"
   - Name: "Mein erstes Projekt"
   - Status: "Aktiv"

2. **Unternehmen hinzufügen**:
   - CRM → Tab "Unternehmen" → "Neues Unternehmen"
   - Name: "Test GmbH"

3. **Zeiterfassung starten**:
   - Zeiterfassung → "Start"
   - Sehen Sie die laufende Zeiterfassung

4. **Ticket erstellen**:
   - Tickets → "Neues Ticket"
   - Titel: "Test-Ticket"

5. **Projekt-Details ansehen**:
   - Projekte → Klicken Sie auf "Bearbeiten" bei einem Projekt
   - Sehen Sie Zeiteinträge, Tickets und Statistiken

## 🔧 Falls Probleme auftreten:

### Backend startet nicht?
```bash
cd backend
npm install
npm run dev
```

### Frontend startet nicht?
```bash
cd frontend
npm install
npm run dev
```

### Datenbank-Fehler?
1. Docker starten: `docker-compose -f docker/docker-compose.yml up -d`
2. Datenbank initialisieren: `./scripts/init-db.sh`
3. Test-Daten laden: `cd backend && npm run seed`

## 📊 System-Status prüfen

```bash
# Backend prüfen
curl http://localhost:3000/health

# Frontend prüfen
curl http://localhost:5173
```

## 🎉 Viel Erfolg!

Das System ist vollständig funktionsfähig und bereit für den Einsatz!

---

**Tipp**: Nutzen Sie `./START_SYSTEM.sh` für den automatischen Start!






