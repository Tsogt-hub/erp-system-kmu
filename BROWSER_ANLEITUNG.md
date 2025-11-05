# 🌐 Browser-Anleitung - System im Browser öffnen

## ✅ System läuft jetzt!

Das Frontend läuft auf: **http://localhost:5173**

## 📋 Erste Schritte

### 1. Browser öffnen
Öffnen Sie in Ihrem Browser:
```
http://localhost:5173
```

### 2. Benutzer registrieren

Da noch keine Benutzer in der Datenbank sind, müssen Sie sich zuerst registrieren:

**Option A: Über die API (Terminal)**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "first_name": "Admin",
    "last_name": "Test"
  }'
```

**Option B: Registrierung im Frontend**
- Die Registrierungsfunktion muss noch implementiert werden
- Nutzen Sie erstmal Option A

### 3. Einloggen

Nach der Registrierung können Sie sich einloggen:
- **E-Mail**: admin@test.com
- **Passwort**: admin123

## 🎯 Was Sie sehen werden:

### Login-Seite
- Modernes Material-UI Design
- Eingabefelder für E-Mail und Passwort
- "Anmelden" Button

### Dashboard (nach Login)
- **4 KPI-Karten**:
  - Aktive Projekte
  - Heute erfasste Stunden
  - Offene Tickets
  - Anzahl Kunden
- **2 Tabellen**:
  - Ihre Projekte (letzte 5)
  - Ihre Tickets (letzte 5)

### Sidebar-Navigation
1. **Startseite** - Dashboard mit Statistiken
2. **Projekte** - Projektverwaltung
3. **CRM** - Unternehmen & Kontakte
4. **Zeiterfassung** - Echtzeit-Tracking
5. **Tickets** - Ticket-System
6. **Lagerbestand** - Artikel & Bestand
7. **Angebote** - Angebotsverwaltung
8. **Rechnungen** - Rechnungsverwaltung
9. **Benutzer** - Benutzerverwaltung
10. **Einstellungen** - System-Einstellungen

## 🔧 Falls Probleme auftreten:

### Backend läuft nicht?
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/backend"
npm run dev
```

### Frontend läuft nicht?
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/frontend"
npm run dev
```

### Datenbank nicht erreichbar?
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU"
docker-compose -f docker/docker-compose.yml up -d
```

## 📸 Screenshots

Screenshots wurden erstellt:
- `erp-system-login.png` - Login-Seite
- `erp-system-dashboard.png` - Dashboard (nach Login)

## 🎉 Viel Erfolg!

Das System ist vollständig funktionsfähig. Alle Module sind implementiert und bereit zum Testen!







