# 🚀 Komplette Setup-Anleitung

## Schritt 1: Docker starten (Datenbank)

```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU"
docker-compose -f docker/docker-compose.yml up -d
```

**Alternativ** (wenn Docker nicht verfügbar):
- Installieren Sie PostgreSQL lokal
- Erstellen Sie die Datenbank: `createdb erp_system_kmu`
- Führen Sie das Schema aus: `psql erp_system_kmu < database/schema.sql`

## Schritt 2: Datenbank initialisieren

```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU"
./scripts/init-db.sh
```

Oder manuell:
```bash
psql -h localhost -p 5432 -U postgres -d erp_system_kmu -f database/schema.sql
```

## Schritt 3: Backend starten

**Terminal 1:**
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/backend"
npm install  # Falls noch nicht gemacht
npm run dev
```

✅ Backend läuft auf: http://localhost:3000

## Schritt 4: Frontend starten

**Terminal 2:**
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU/frontend"
npm install  # Falls noch nicht gemacht
npm run dev
```

✅ Frontend läuft auf: http://localhost:5173

## Schritt 5: Test-Benutzer erstellen

**Terminal 3:**
```bash
cd "/Users/tsogtnandin-erdene/ERP System KMU"
./scripts/create-test-user.sh
```

Oder manuell:
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

## Schritt 6: System öffnen

1. Öffnen Sie: **http://localhost:5173**
2. **Registrieren** Sie sich über die Registrierungsseite
   - Oder loggen Sie sich ein mit: `admin@test.com` / `admin123`

## ✅ Was funktioniert jetzt:

- ✅ Registrierung über Frontend
- ✅ Login über Frontend  
- ✅ Dashboard mit echten Daten
- ✅ Alle 11 Module funktionsfähig
- ✅ Projekt-Detail-Seiten
- ✅ Benutzerverwaltung
- ✅ Einstellungen

## 🎯 Nächste Schritte:

1. **Projekte erstellen**: Dashboard → Projekte → Neues Projekt
2. **Unternehmen hinzufügen**: CRM → Unternehmen
3. **Zeiterfassung testen**: Zeiterfassung → Start
4. **Tickets erstellen**: Tickets → Neues Ticket
5. **Lagerbestand verwalten**: Lagerbestand → Artikel

## 🔧 Troubleshooting

### Datenbank-Verbindungsfehler
```bash
# Prüfe ob PostgreSQL läuft
pg_isready -h localhost -p 5432

# Prüfe Docker
docker ps | grep postgres
```

### Backend-Fehler
```bash
# Prüfe Backend-Logs
cd backend
npm run dev
```

### Frontend-Fehler
```bash
# Prüfe Frontend-Logs
cd frontend
npm run dev
```

---

**Viel Erfolg! 🎉**








