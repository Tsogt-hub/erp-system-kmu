# 🧪 Testing Guide - ERP System KMU

## ✅ System-Test-Übersicht

### 1. Authentifizierung

#### Registrierung
1. Navigiere zu: http://localhost:5173/register
2. Fülle das Formular aus:
   - Vorname: z.B. "Test"
   - Nachname: z.B. "Benutzer"
   - E-Mail: z.B. "neuer.user@test.com"
   - Passwort: Mindestens 6 Zeichen (z.B. "test123")
3. Klicke auf "Registrieren"
4. ✅ Erwartetes Ergebnis: Automatischer Login und Weiterleitung zum Dashboard

#### Login
1. Navigiere zu: http://localhost:5173/login
2. Verwende Test-Account:
   - E-Mail: `admin@test.com`
   - Passwort: `admin123`
3. Klicke auf "Anmelden"
4. ✅ Erwartetes Ergebnis: Login erfolgreich, Weiterleitung zum Dashboard

### 2. Dashboard

1. Nach Login sollte das Dashboard angezeigt werden
2. Prüfe Statistiken:
   - Anzahl Projekte
   - Anzahl Tickets
   - Anzahl Rechnungen
   - Anzahl Angebote
3. ✅ Erwartetes Ergebnis: Dashboard zeigt echte Daten aus der Datenbank

### 3. Projekte

#### Projekt-Liste
1. Navigiere zu: "Projekte" im Sidebar
2. ✅ Erwartetes Ergebnis: Liste der Projekte wird angezeigt (2 Projekte aus Test-Daten)

#### Projekt-Details
1. Klicke auf ein Projekt
2. Prüfe:
   - Projekt-Informationen
   - Timeline
   - Zeit-Einträge
   - Tickets
3. ✅ Erwartetes Ergebnis: Alle Projekt-Daten werden korrekt angezeigt

#### Neues Projekt erstellen
1. Klicke auf "Neues Projekt"
2. Fülle das Formular aus
3. Speichere
4. ✅ Erwartetes Ergebnis: Projekt wird erstellt und in der Liste angezeigt

### 4. CRM

#### Unternehmen
1. Navigiere zu: "CRM" → "Unternehmen"
2. ✅ Erwartetes Ergebnis: Liste der Unternehmen (2 Unternehmen aus Test-Daten)

#### Neues Unternehmen erstellen
1. Klicke auf "Neues Unternehmen"
2. Fülle das Formular aus
3. Speichere
4. ✅ Erwartetes Ergebnis: Unternehmen wird erstellt

#### Kontakte
1. Navigiere zu: "CRM" → "Kontakte"
2. ✅ Erwartetes Ergebnis: Liste der Kontakte wird angezeigt

### 5. Zeit-Tracking

1. Navigiere zu: "Zeit-Tracking"
2. ✅ Erwartetes Ergebnis: Liste der Zeit-Einträge wird angezeigt (2 Einträge aus Test-Daten)

#### Neuer Zeit-Eintrag
1. Klicke auf "Neuer Eintrag"
2. Fülle das Formular aus:
   - Projekt auswählen
   - Start- und Endzeit
   - Beschreibung
3. Speichere
4. ✅ Erwartetes Ergebnis: Zeit-Eintrag wird erstellt und angezeigt

### 6. Tickets

1. Navigiere zu: "Tickets"
2. ✅ Erwartetes Ergebnis: Liste der Tickets wird angezeigt (2 Tickets aus Test-Daten)

#### Neues Ticket erstellen
1. Klicke auf "Neues Ticket"
2. Fülle das Formular aus:
   - Titel
   - Beschreibung
   - Priorität
   - Zugewiesener Benutzer
   - Projekt
3. Speichere
4. ✅ Erwartetes Ergebnis: Ticket wird erstellt

#### Ticket-Status ändern
1. Öffne ein Ticket
2. Ändere den Status (z.B. von "offen" zu "in Bearbeitung")
3. Speichere
4. ✅ Erwartetes Ergebnis: Status wird aktualisiert

### 7. Inventar

#### Artikel
1. Navigiere zu: "Inventar" → "Artikel"
2. ✅ Erwartetes Ergebnis: Liste der Artikel wird angezeigt (2 Artikel aus Test-Daten)

#### Neuer Artikel
1. Klicke auf "Neuer Artikel"
2. Fülle das Formular aus:
   - Name
   - SKU
   - Preis
   - Kategorie
3. Speichere
4. ✅ Erwartetes Ergebnis: Artikel wird erstellt

#### Lagerbestand
1. Navigiere zu: "Inventar" → "Lagerbestand"
2. ✅ Erwartetes Ergebnis: Lagerbestand wird angezeigt (50 Solarmodule)

### 8. Angebote

1. Navigiere zu: "Angebote"
2. ✅ Erwartetes Ergebnis: Liste der Angebote wird angezeigt (1 Angebot aus Test-Daten)

#### Neues Angebot erstellen
1. Klicke auf "Neues Angebot"
2. Fülle das Formular aus:
   - Kunde auswählen
   - Projekt (optional)
   - Betrag
   - Status
3. Speichere
4. ✅ Erwartetes Ergebnis: Angebot wird erstellt mit automatischer Angebotsnummer

### 9. Rechnungen

1. Navigiere zu: "Rechnungen"
2. ✅ Erwartetes Ergebnis: Liste der Rechnungen wird angezeigt (1 Rechnung aus Test-Daten)

#### Neue Rechnung erstellen
1. Klicke auf "Neue Rechnung"
2. Fülle das Formular aus:
   - Kunde auswählen
   - Projekt (optional)
   - Betrag
   - Status
   - Fälligkeitsdatum
3. Speichere
4. ✅ Erwartetes Ergebnis: Rechnung wird erstellt mit automatischer Rechnungsnummer

### 10. Benutzerverwaltung

1. Navigiere zu: "Benutzer" (nur für Admins)
2. ✅ Erwartetes Ergebnis: Liste der Benutzer wird angezeigt (3 Benutzer aus Test-Daten)

### 11. Einstellungen

1. Navigiere zu: "Einstellungen"
2. ✅ Erwartetes Ergebnis: Einstellungsseite wird angezeigt

## 🔍 Häufige Probleme und Lösungen

### Problem: "Registration failed"
- **Lösung**: Backend läuft nicht oder Datenbank ist nicht initialisiert
- **Prüfen**: `curl http://localhost:3000/health`

### Problem: "Login failed"
- **Lösung**: Falsche E-Mail/Passwort oder Benutzer existiert nicht
- **Test-Account**: `admin@test.com` / `admin123`

### Problem: "Dashboard zeigt keine Daten"
- **Lösung**: Datenbank-Seeding ausführen
- **Befehl**: `cd backend && npm run seed-sqlite`

### Problem: "Module nicht erreichbar"
- **Lösung**: Backend läuft nicht
- **Prüfen**: Backend-Logs im Terminal

## 📊 Test-Checkliste

- [ ] Registrierung funktioniert
- [ ] Login funktioniert
- [ ] Dashboard zeigt Daten
- [ ] Projekte können erstellt/bearbeitet werden
- [ ] CRM funktioniert (Unternehmen, Kontakte)
- [ ] Zeit-Tracking funktioniert
- [ ] Tickets können erstellt/bearbeitet werden
- [ ] Inventar funktioniert (Artikel, Lagerbestand)
- [ ] Angebote können erstellt werden
- [ ] Rechnungen können erstellt werden
- [ ] Benutzerverwaltung funktioniert (Admin)
- [ ] Einstellungen sind erreichbar

## 🎯 Automatische Tests

### Backend API-Tests
```bash
# Login testen
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Dashboard-Stats testen (mit Token)
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend-Tests
Öffne Browser-Entwicklertools (F12) und prüfe:
- Keine Console-Errors
- Network-Requests erfolgreich (Status 200)
- Daten werden korrekt geladen

---

**Viel Erfolg beim Testen! 🚀**





