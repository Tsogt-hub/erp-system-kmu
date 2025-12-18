# Hero Software - Workflow Angebotserstellung

## Schritt-für-Schritt Anleitung

---

## Übersicht

Der Angebots-Workflow in Hero folgt diesem Muster:

```
Kontakt erstellen → Projekt anlegen → Angebot erstellen → Positionen hinzufügen → PDF erstellen → Versenden
```

---

## Schritt 1: Kontakt erstellen

### Navigation
1. Klicke auf **"+ Neu"** in der oberen Toolbar
2. Wähle **"Kontakt"** aus dem Dropdown

### Pflichtfelder ausfüllen
1. **Kategorie**: Kunde (Standard)
2. **Typ**: Person oder Firma
3. **Anrede**: Herr/Frau/Familie/etc.
4. **Vorname**: Eingeben
5. **Nachname**: Eingeben
6. **Kundennummer**: Wird automatisch vorgeschlagen (z.B. 5035)

### Kontaktdetails (Tab 1)
1. **E-Mail-Adresse**: Wichtig für Kommunikation
2. **Erreichbarkeit**: Wann ist der Kunde erreichbar?
   - Vormittags
   - Nachmittags
   - Abends
   - Ganztags
   - Nur am Wochenende
   - ausschließlich per E-Mail
3. **Quelle**: Woher kam der Kontakt?
   - E-Mail
   - Persönlicher Kontakt
   - Messe
   - Social Media
   - Online-Portal
   - Telefon
   - Eigene Webseite
   - Empfehlung
   - etc.
4. **Telefon/Mobil**: Kontaktnummern

### Adresse (Tab 2)
1. **Straße & Hausnummer**: Mit Google-Autocomplete
2. **PLZ**: Postleitzahl
3. **Ort**: Stadt
4. **Land**: Deutschland (Standard)

### Speichern
- Klicke auf **"Erstellen"**

---

## Schritt 2: Projekt anlegen

### Navigation
1. Klicke auf **"+ Neu"** in der oberen Toolbar
2. Wähle **"Projekt"** aus dem Dropdown

### Projekt-Informationen
1. **Projektname**: Beschreibender Name
2. **Kunde zuordnen**: Kontakt auswählen
3. **Projektadresse**: Kann vom Kontakt übernommen werden
4. **Gewerk/Kategorie**: 
   - PV (Photovoltaik)
   - Wärmepumpen
   - Service / Problemfälle
   - Leads
5. **Projektstatus**: Entsprechend der Pipeline

### Speichern
- Klicke auf **"Erstellen"**

---

## Schritt 3: Angebot erstellen

### Option A: Aus Projekt heraus
1. Öffne das Projekt
2. Klicke auf **"+ Neu"** → **"Dokument"**
3. Wähle Dokumenttyp **"Angebot"**

### Option B: Über Dokumentenübersicht
1. Navigiere zu **Dokumente** → **Dokumentenübersicht**
2. Klicke auf **"+ Neu"** → **"Dokument"**
3. Wähle Dokumenttyp **"Angebot"**
4. Ordne Projekt/Kontakt zu

### Automatische Datenübernahme
Nach dem Erstellen werden automatisch übernommen:
- **Firmenadresse** (Absender)
- **Kundenname** (aus Kontakt)
- **Kundenadresse** (aus Kontakt)
- **BV (Bauvorhaben)** (aus Projektadresse)
- **Angebot-Nr.** (Auto-generiert: ANG-xxxx)
- **Projektnummer**
- **Datum** (aktuelles Datum)
- **Kundennummer**
- **Telefon**
- **E-Mail**

---

## Schritt 4: Einleitungstext bearbeiten

### Standard-Einleitung
```
Sehr geehrter Herr [Nachname],

vielen Dank für Ihre Anfrage. Anbei erhalten Sie unser Angebot.
```

### Anpassen
1. Klicke in den Einleitungstext-Bereich
2. Nutze den Rich-Text-Editor für:
   - Formatierung (fett, unterstrichen)
   - Schriftgröße
   - Listen
   - Tabellen
3. Nutze **Vorlagen/Platzhalter** für dynamische Texte

---

## Schritt 5: Positionen hinzufügen

### Methode 1: Aus Artikelstamm (empfohlen)
1. Rechte Sidebar: **"Artikel & Leistungen"** Tab
2. **Suchfeld** nutzen: Name, Hersteller, Kategorie
3. **"+"** Button neben dem gewünschten Artikel klicken
4. Artikel wird automatisch zum Angebot hinzugefügt

### Methode 2: Neuen Artikel erstellen
1. Klicke auf **"+ Artikel"** oder **"+ Leistung"**
2. Fülle die Felder aus:
   - Bezeichnung
   - Menge
   - Einheit
   - Preis
   - Beschreibung
3. Speichern

### Position bearbeiten
1. Klicke auf die Position im Angebot
2. Bearbeite:
   - **Menge** anpassen
   - **Preis** ändern
   - **Beschreibung** erweitern
   - **Rabatt** hinzufügen
3. Position als **Bedarfsposition** oder **Alternative** markieren

### Positionstypen
| Typ | Anzeige | Verwendung |
|-----|---------|------------|
| Standard | Normal | Hauptpositionen |
| Bedarfsposition | (Betrag) | Optionale Extras |
| Alternative | (Betrag) | Ersatzprodukte |
| Rabatt | Rabatt X% | Preisnachlass |

### Reihenfolge ändern
- Positionen können per Drag & Drop umsortiert werden
- Oder über **"Positionen"** Button in der Toolbar

---

## Schritt 6: Summenblock prüfen

### Automatische Berechnung
```
Bedarfsposition          (120,00 €)
Alternative Positionen   (2.705,89 €)
─────────────────────────────────────
Nettobetrag              13.017,95 €
zzgl. 0% MwSt.           0,00 €
─────────────────────────────────────
Gesamtsumme              13.017,95 €
```

### Hinweise
- Bedarfs- und Alternative Positionen werden in Klammern angezeigt
- Diese werden NICHT in die Gesamtsumme eingerechnet
- MwSt. wird je nach Einstellung berechnet (0%, 7%, 19%)

---

## Schritt 7: Fußtexte anpassen

### Zahlungsbedingungen
Standard-Optionen:
```
50% der Auftragssumme bei Auftragserteilung
50% der Auftragssumme bei Fertigstellung

oder

1,5% Skonto bei 90% Anzahlung
10% bei Fertigstellung

oder

Kauf auf Rechnung +3%
```

### Wichtige Informationen
- Bauprüfung
- Datenverbindung (LAN)
- Auskunftspflicht
- Zusatzfahrten

### Bemerkungen
- Projektspezifische Notizen

### Vertragsbestimmungen
- AGB-Punkte
- Haftung
- Eigentumsvorbehalt

### Unterschriftsfelder
```
Ort, Datum / Unterschrift Kunde
______________________________

Unterschrift Vertrieb Elite PV GmbH
______________________________
```

---

## Schritt 8: PDF-Vorschau

### Vorschau öffnen
1. Klicke auf **"PDF-Vorschau"** Tab
2. Prüfe das Layout
3. Kontrolliere:
   - Briefkopf korrekt?
   - Alle Positionen vorhanden?
   - Preise stimmen?
   - Texte vollständig?

### Korrekturen
1. Zurück zu **"Entwurf"** Tab
2. Änderungen vornehmen
3. Erneut Vorschau prüfen

---

## Schritt 9: Dokument abschließen

### Finalisieren
1. Klicke auf **"Dokument abschließen"**
2. Bestätige die Aktion
3. Status wechselt von "Entwurf" zu "Erstellt"

### Nach Abschluss
- Dokumentnummer wird final vergeben (ANG-3944)
- PDF wird generiert
- Änderungen nur noch eingeschränkt möglich

---

## Schritt 10: Versenden

### Optionen
1. **PDF herunterladen** und per E-Mail versenden
2. **Direkt aus Hero versenden** (wenn E-Mail-Integration aktiv)

### Status aktualisieren
- Nach Versand: Status auf "Versendet" setzen
- Bei Annahme: Auftragsbestätigung erstellen

---

## Tipps & Best Practices

### Vorlagen nutzen
1. **"Vorlagen"** Button in der Toolbar
2. Vorgefertigte Angebotsvorlagen laden
3. Spart Zeit bei wiederkehrenden Angeboten

### Preise aktualisieren
1. **"Preise aktualisieren"** Button
2. Aktualisiert alle Preise aus dem Artikelstamm
3. Wichtig nach Preisänderungen

### Zeiten einfügen
1. **"Zeiten einfügen"** Button
2. Fügt erfasste Arbeitszeiten als Positionen ein
3. Für Stundenabrechnungen

### Übersicht nutzen
- Rechte Sidebar zeigt:
  - Anzahl Positionen
  - Anzahl Artikel/Leistungen
  - Arbeitszeit
  - Gesamtsumme
  - PDF-Erstellungsdatum

### Gliederung
- Titel in Positionen einfügen
- Automatisches Inhaltsverzeichnis
- Klickbare Navigation

---

## Workflow-Diagramm

```
┌─────────────────┐
│  Kontakt        │
│  erstellen      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Projekt        │
│  anlegen        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Angebot        │
│  erstellen      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Positionen     │
│  hinzufügen     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Texte          │
│  anpassen       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PDF-Vorschau   │
│  prüfen         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Dokument       │
│  abschließen    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Versenden      │
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Angenommen?    │
│  → AB erstellen │
└─────────────────┘
```

---

## Folgedokumente

Nach Angebotsannahme:
1. **Auftragsbestätigung (AB)** erstellen
2. **Materialliste (ML)** generieren
3. **Rechnung (RE)** nach Fertigstellung

---

*Erstellt am 27.11.2025 durch Browser-MCP-Analyse*
