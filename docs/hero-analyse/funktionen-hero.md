# Hero Software - Vollständige Funktionsanalyse

## Datum der Analyse: 27.11.2025

---

## 1. Hauptnavigation

### Obere Toolbar
- **HERO Logo** - Link zur Startseite
- **Suchen...** - Globale Suchfunktion
- **+ Neu** - Schnellzugriff zum Erstellen von:
  - Projekt
  - Kontakt
  - Aufgabe
  - Dokument
  - Termin
  - Zeiteintrag
  - Auftrag
- **Alle Projekte** - Dropdown zur Projektauswahl
- **Benachrichtigungen** - Badge mit Anzahl (30)
- **Benutzerprofil** - Profilbild und Einstellungen

### Linke Sidebar
1. **Übersicht** - Dashboard
2. **Auswertungen** - Reports/Dashboards
3. **Kontakte** - CRM-Modul
4. **Projekte** - Mit Untermenüs:
   - PV
   - 🆕 Leads
   - ☀️ PV Neu
   - ♨️ Wärmepumpen
   - 🔁 Service / Problemfälle
5. **Dokumente** - Mit Untermenüs:
   - Dokumentenübersicht
   - Texte & Titel
   - Vorlagen
   - Konfigurator
   - Ausschreibungen (GAEB)
6. **Artikelstamm** - Mit Untermenüs:
   - Artikel
   - Leistungen
   - Verkaufspreise
7. **Lager** - Lagerverwaltung
8. **Wartungsverträge** - Field Service
9. **Aufträge** - Auftragsverwaltung
10. **Aufgaben** - Task-Management
11. **Planung** - Plantafel
12. **Buchhaltung** - Finanzen
13. **Persönliche Daten** - Mitarbeiter-Profil
14. **Mitarbeiterverwaltung** - HR
15. **Firmeneinstellungen** - Administration
16. **300€ verdienen!** - Empfehlungsprogramm

---

## 2. Kontaktverwaltung (CRM)

### Kontaktübersicht
**Kategorien/Tabs:**
- Alle
- Kunden
- Lieferanten
- Partner
- Ansprechpartner
- Archiv

**Tabellen-Spalten:**
| Spalte | Beschreibung |
|--------|--------------|
| Typ | Person/Firma |
| Kundennummer | Eindeutige ID |
| Firmenname | Unternehmensname |
| Vorname | Kontakt-Vorname |
| Nachname | Kontakt-Nachname |
| E-Mail | E-Mail-Adresse |
| Kategorie | Kunde/Lieferant/Partner/Ansprechpartner |
| Ort | Vollständige Adresse |

**Filter-Optionen:**
- Typ (Person/Firma)
- Kundennummer
- Firmenname
- Vorname
- Nachname
- E-Mail
- Kategorie
- Ort

**Aktionen:**
- Gruppenaktion
- Export
- Suchen
- Spalten anpassen

### Kontakt-Erstellungsmaske

**Hauptfelder:**
| Feld | Typ | Optionen |
|------|-----|----------|
| Kategorie | Dropdown | Kunde, Lieferant, Partner |
| Typ | Radio | Person, Firma |
| Visitenkarte hochladen | Upload | vCard-Import |
| Anrede | Dropdown | Herr, Frau, Familie, Eheleute, Dr., Prof., Prof. Dr. |
| Weitere Anrede | Text | Freitext |
| Vorname | Text | Pflichtfeld |
| Nachname | Text | Pflichtfeld |
| Kundennummer | Text | Auto-generiert |
| Position/Funktion | Text | Optional |

**Tab: Kontaktdetails**
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| Emailadresse | Text | Haupt-E-Mail |
| Rechnungsempfänger | Checkbox | Markierung |
| Erreichbarkeit | Dropdown | Vormittags, Nachmittags, Abends, Ganztags, Nur am Wochenende, ausschließlich per E-Mail, Sonstige |
| Quelle | Dropdown | E-Mail, Persönlicher Kontakt, Messe, Social Media, Online-Portal, Telefon, Eigene Webseite, Empfehlung, Bestandskunde, Außenwerbung, Netzwerk, Interessent, Flyer/Prospekt, Fahrzeugwerbung |
| Festnetz | Text | Telefonnummer |
| Mobiltelefon | Text | Handynummer |
| Website | Text | URL |
| Fax | Text | Faxnummer |
| Geburtsdatum | Datum | Optional |

**Tab: Adresse**
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| Straße & Hausnummer | Text | Mit Google-Autocomplete |
| 1. Adresszeile | Text | Optional |
| 2. Adresszeile | Text | Optional |
| Postleitzahl | Text | PLZ |
| Ort | Text | Stadt |
| Land | Dropdown | Umfangreiche Länderliste |

**Tab: Konditionen**
- Zahlungsbedingungen
- Skonto-Einstellungen

**Tab: Zahlungsdaten**
- Bankverbindung
- SEPA-Mandat

**Tab: ZUGFeRD 2.0 Standard**
- E-Rechnung-Einstellungen

### Kontakt-Detailseite

**Tabs/Bereiche:**
1. **Logbuch** - Chronologische Historie mit:
   - Benutzer-Avatar
   - Zeitstempel
   - Aktionstyp (Baustellenplanung, Bilder hochgeladen, etc.)
   - Beschreibung
   - Verlinkte Bilder/Dateien
2. **Bilder** - Galerie mit Anzahl-Badge
3. **Dokumente** - Zugeordnete Dokumente
4. **Ausschreibungen (GAEB)** - AVA-Projekte
5. **Ansprechpartner** - Verknüpfte Kontakte
6. **Aufgaben** - Zugeordnete Tasks
7. **Aufträge** - Kundenaufträge
8. **Projekte** - Verknüpfte Projekte
9. **Objektadressen** - Alternative Adressen

**Kontaktdaten-Anzeige:**
- Name (mit Anrede)
- Kundennummer
- Erreichbarkeit
- Anschrift

**Notizen-Bereich:**
- Textfeld für dauerhafte Informationen
- Hinweis: "Alle anderen Informationen werden im Logbuch festgehalten"

---

## 3. Dokumentenverwaltung

### Dokumenttypen
| Typ | Nummernkreis | Beschreibung |
|-----|--------------|--------------|
| Angebot | ANG-xxxx | Kundenangebote |
| Auftragsbestätigung | AB-xxx | Nach Angebotsannahme |
| Rechnung | RE-xxxx | Abschluss-/Teilrechnung |
| Rechnung §13b | - | Reverse-Charge |
| Mahnung | M-xxxxx | Zahlungserinnerung |
| Materialliste | ML-xxx | Bestellliste |
| Lieferschein | - | Warenlieferung |
| Arbeitsbericht | - | Dokumentation |
| Baustellenbericht AC/DC | - | PV-spezifisch |
| Aufmaßdokument | - | Vermessung |
| Bestellschein | - | Lieferantenbestellung |
| Brief | - | Korrespondenz |
| Gutschrift | - | Rückerstattung |
| Kalkulation | - | Interne Berechnung |
| Stornorechnung | - | Stornierung |
| Teilrechnung | - | Abschlagszahlung |
| Wartungsauftrag | - | Service |
| Reparaturauftrag | - | Reparatur |
| Zahlungserinnerung | - | Vor Mahnung |

### Dokumentenstatus
- Entwurf
- Erstellt
- Versendet
- Storniert
- Erstellt (Hochgeladen)

### Dokumentenübersicht
**Spalten:**
- # (Dokumentnummer)
- Name (Dateiname)
- Typ
- Ordner
- Kunde
- Ansprechpartner
- Projektadresse
- Nettobetrag
- Bruttobetrag
- Datum
- Status

**Filter:**
- Dokumentnummer
- Name
- Typ (Dropdown)
- Ordner (Dropdown)
- Kunde
- Ansprechpartner
- Projektadresse
- Betrag (Von/Bis)
- Datum (Von/Bis)
- Status

---

## 4. Angebotserstellung (WICHTIGSTER TEIL)

### Obere Toolbar
| Button | Funktion |
|--------|----------|
| Entwurf | Bearbeitungsmodus |
| PDF-Vorschau | Vorschau anzeigen |
| Zum Projekt | Link zum Projekt |
| Preise aktualisieren | Preise aus Artikelstamm |
| Zeiten einfügen | Arbeitszeiten hinzufügen |
| Positionen | Positionsmanagement |
| Vorlagen | Angebotsvorlagen |
| Dokument abschließen | Finalisieren |
| Mehr | Weitere Optionen |

### Briefkopf-Bereich
**Automatisch ausgefüllt:**
- Firmenadresse (Absender)
- Kundenname (aus Projekt/Kontakt)
- Kundenadresse
- BV (Bauvorhaben/Projektadresse)
- Angebot-Nr. (Auto-generiert)
- Projektnummer
- Datum
- Kundennummer
- Telefon
- E-Mail

### Rich-Text Editor
**Formatierungstools:**
- Stil (Überschriften)
- Schriftgröße
- Fett (⌘+B)
- Unterstrichen (⌘+U)
- Zurücksetzen (⌘+\\)
- Schriftart (Arial, etc.)
- Textfarbe
- Aufzählung
- Nummerierung
- Absatz
- Tabelle
- Vorlagen/Platzhalter
- Bild hinzufügen
- Seitenumbruch
- Quellcode anzeigen
- Link (⌘+K)

### Positionstabelle
**Spalten:**
| Spalte | Beschreibung |
|--------|--------------|
| Pos | Positionsnummer (0.001, 0.002, etc.) |
| Menge | Anzahl |
| Einheit | Stk, pauschal, km, Std, etc. |
| Bezeichnung | Artikelname + Beschreibung |
| MwSt. | Mehrwertsteuersatz |
| Einheitspreis | Preis pro Einheit |
| Gesamt | Menge × Einheitspreis |

**Positionstypen:**
- **Standard** - Normale Position
- **Bedarfsposition** - Optional, in Klammern angezeigt
- **Alternative Position** - Ersatzprodukt, in Klammern
- **Rabatt** - Prozentuale Reduzierung

**Positionsinhalt:**
- Artikelbild (Thumbnail)
- Artikelname (fett)
- Ausführliche Beschreibung (formatierter Text)
- Technische Daten als Liste

### Summenblock
```
Bedarfsposition          (120,00 €)
Alternative Positionen   (2.705,89 €)
Nettobetrag              13.017,95 €
zzgl. 0% MwSt.           0,00 €
Gesamtsumme              13.017,95 €
```

### Fußtext-Bereiche (Mehrere Rich-Text-Editoren)

**1. Steuertipp:**
- Hinweis zu Handwerkerleistungen (§ 35a EStG)

**2. Gültigkeit:**
- "Das Angebot hat eine Gültigkeit von 3 Wochen ab Empfang."

**3. Zahlungsbedingungen:**
- 50%/50% Option
- Skonto-Option (1,5% bei 90%)
- Kauf auf Rechnung (+3%)
- Bürgschaft-Option

**4. Wichtige Informationen:**
- Bauprüfung
- Datenverbindung (LAN)
- Auskunftspflicht Dachkonstruktion
- Zusatzfahrten & Mehraufwand

**5. Bemerkungen:**
- Freitext-Bereich

**6. Vertragsbestimmungen:**
- AGB-Punkte
- Haftungsausschlüsse
- Eigentumsvorbehalt

**7. Optionale Checkboxen:**
- ☐ Versicherung
- ☐ Datenschutz

**8. Unterschriftsfelder:**
- Ort, Datum / Unterschrift Kunde
- Unterschrift Vertrieb

**9. Wartungsvertrag (Optional):**
- Vollständige Vertragsdetails §1-§12

**10. SEPA-Lastschriftmandat:**
- Zahlungspflichtigen-Angaben
- Mandatsreferenz

### Rechte Sidebar - Artikel & Leistungen

**Tabs:**
- Artikel & Leistungen
- Texte & Titel

**Aktionen:**
- **+ Artikel** - Neuen Artikel erstellen
- **+ Leistung** - Neue Leistung erstellen

**Artikelsuche:**
- Suchfeld (Name, Hersteller, Kategorie, Bezeichnung)
- Erweiterte Suche

**Artikelliste:**
- "+" Button zum Hinzufügen
- Artikelname
- Preis pro Einheit
- Kurzbeschreibung (gekürzt)

### Übersicht-Panel
| Feld | Wert |
|------|------|
| Positionen | 19 |
| Artikel | 19 |
| Leistungen | 0 |
| Arbeitszeit | 00:00 h |
| Gesamt | 13.017,95 € |
| Gesamt inkl. MwSt. | 13.017,95 € |
| PDF erstellt | 27.11.2025 15:51 |

### Gliederung
- Automatische Inhaltsverzeichnis aus Titeln
- Klickbare Navigation im Dokument

---

## 5. Artikelstamm (DETAILLIERTE ANALYSE)

### Untermenüs
- **Artikel** - Physische Produkte (/SupplyProducts/index)
- **Leistungen** - Dienstleistungen (/SupplyServices/index)
- **Verkaufspreise** - Preislisten/Preisformeln (/DocumentElements/sales_prices)

---

### 5.1 Artikel (SupplyProducts)

**Listenansicht - Tabellenspalten:**
| Spalte | Beschreibung |
|--------|--------------|
| Artikelnummer | Eindeutige ID / SKU |
| Name | Artikelbezeichnung |
| Kategorie | Produktkategorie |
| Beschreibung | Gekürzte Beschreibung mit Expand-Button |
| EK | Einkaufspreis mit Einheit (z.B. "57,00 €/Stk") |
| Lieferanten Nr. | Bestellnummer beim Lieferanten |
| Geändert | Datum der letzten Änderung |
| VK Verkaufspreis | Verkaufspreis mit Einheit |
| Aktionen | Icons für Bearbeiten/Löschen |

**Artikel-Felder (aus Gruppenaktions-Modal):**
| Feld | Beschreibung | Typ |
|------|--------------|-----|
| Artikelnummer | Eindeutige Kennung / SKU | Text |
| EAN | Europäische Artikelnummer (Barcode) | Text |
| Name | Artikelbezeichnung | Text (Pflicht) |
| Beschreibung | Ausführlicher Text | Multiline |
| Einheit | Mengeneinheit | Dropdown: Stk, pauschal, m, m², km, Std, Satz |
| Lieferant | Verknüpfung zum Lieferanten-Kontakt | Beziehung |
| Hersteller | Herstellername | Text |
| Preisberechnung | Formel für VK-Berechnung | Dropdown/Formel |
| Standardverkaufspreis | VK-Preis netto | Währung |
| Einkaufspreis | EK-Preis netto | Währung |
| MwSt | Mehrwertsteuersatz | Dropdown: 0%, 7%, 19% |
| Kategorie | Produktkategorie | Dropdown |
| Kostenstelle | Kostenstellenzuordnung | Dropdown |

**Toolbar-Aktionen:**
- "+ Artikel" - Neuen Artikel erstellen
- "Artikelstämme" - Verknüpfung zu Stammdaten
- "Als Lagerartikel erstellen" - Lagerverknüpfung
- "Gruppenaktion" - Massenbearbeitung
- "Export" - CSV-Export
- Spalteneinstellungen

**Filter/Suche:**
- Artikelnummer (Text)
- Name (Text)
- Kategorie (Text)
- Beschreibung (Text)
- Lieferanten Nr. (Text)
- Geändert (Datumsbereich Von/Bis)

---

### 5.2 Leistungen (SupplyServices)

**Listenansicht - Tabellenspalten:**
| Spalte | Beschreibung |
|--------|--------------|
| # | Nummer/ID |
| Name | Leistungsbezeichnung |
| Beschreibung | Ausführliche Beschreibung |
| Interner Name | Interne Bezeichnung für Suche |
| Zeit(Min.) | Zeitaufwand in Minuten |
| Hersteller | Optional: Hersteller |
| EAN | Europäische Artikelnummer |
| Preis | Preis mit Einheit |
| MwSt | Mehrwertsteuersatz |
| Datum | Erstellungs-/Änderungsdatum |

**Leistungs-Felder:**
| Feld | Beschreibung | Typ |
|------|--------------|-----|
| Name | Leistungsbezeichnung | Text (Pflicht) |
| Beschreibung | Ausführlicher Text | Multiline |
| Interner Name | Suchbegriff/Alias | Text |
| Zeit (Minuten) | Arbeitszeit-Kalkulation | Zahl |
| Hersteller | Optional | Text |
| EAN | Barcode | Text |
| Preis | VK-Preis | Währung |
| MwSt | Steuersatz | Dropdown |
| Bild | Produktbild | Upload |

**Beispiel-Leistungen (aus Hero):**
- Elektroinstallation & AC/DC-Montage (1800 Min., 2.737,75 €)
- Konzeption & Setup
- Workflow-Entwicklung
- Testing & Qualitätssicherung
- Go-Live Support
- Premium-Support Paket
- Basis-Support (Break-Fix)
- Demontage/Ausbau der Bestandsheizung
- Dachdecker-Spenglermeister (Stundensatz)
- Solarcarport (mit Zeitangabe)

---

### 5.3 Verkaufspreise (DocumentElements/sales_prices)

**Listenansicht:**
| Spalte | Beschreibung |
|--------|--------------|
| Name | Preisregel-Bezeichnung |
| Formel | Berechnungsformel |

**Verkaufspreis-Regeln:**
Ermöglicht automatische VK-Berechnung basierend auf EK-Preis.

**Beispiel-Formel:**
- Name: "Verkaufspreis Standard"
- Formel: "Einkaufspreis + 30,00%"

**Nutzung:**
- Wird in Artikel-Einstellungen als "Preisberechnung" referenziert
- Automatische VK-Aktualisierung bei EK-Änderung
- Multiple Preisregeln für verschiedene Kundengruppen möglich

---

### 5.4 Beispiel-Artikelkategorien (PV-spezifisch)
- Solarmodule (Modul)
- Wechselrichter (Inverter)
- Speicher (Storage)
- Optimierer
- Unterkonstruktion/Montagesystem
- Montage-Dienstleistungen
- Elektroinstallation
- Überspannungsschutz
- Wallboxen (E-Mobility)
- Heizstäbe
- Zählerschränke
- Netzwerk (WLAN, Powerline)
- Monitoring (Solarlog)

---

## 6. Weitere Module

### Lager
- Lagerverwaltung
- Bestandsführung
- Warenbewegungen

### Wartungsverträge
- Field Service Objects
- Wartungsplanung

### Aufträge
- Auftragsverwaltung
- Status-Tracking

### Aufgaben
- Task-Management
- Zuweisungen

### Planung
- Plantafel
- Ressourcenplanung
- Terminplanung

### Buchhaltung
- Finanzen
- Offene Posten
- Zahlungseingänge

### Mitarbeiterverwaltung
- HR-Funktionen
- Benutzerrechte

### Firmeneinstellungen
- Administration
- Systemkonfiguration

---

## 7. Besondere Features

### Logbuch-System
- Chronologische Historie für jeden Kontakt/Projekt
- Automatische Einträge (Bilder hochgeladen, Termine, etc.)
- Manuelle Einträge (+ Eintrag Button)
- Suchfunktion im Logbuch
- Benutzer-Zuordnung mit Avatar
- Zeitstempel

### Platzhalter-System
- `{{Project.name}}` - Projektname
- Weitere Platzhalter für automatische Textgenerierung

### Dokumenten-Workflow
1. Entwurf erstellen
2. Positionen hinzufügen
3. Texte anpassen
4. PDF-Vorschau
5. Dokument abschließen
6. Versenden

### Export-Funktionen
- PDF-Export
- Daten-Export (vermutlich CSV/Excel)

---

## 8. Zusammenfassung der Kernfunktionen

1. **CRM** - Vollständige Kontaktverwaltung mit Kategorien, Lead-Quellen, Erreichbarkeit
2. **Projektverwaltung** - Gewerke-basierte Projektstruktur (PV, Wärmepumpen, Service)
3. **Dokumentenerstellung** - Rich-Text-Editor mit Vorlagen, Platzhaltern, Bildintegration
4. **Artikelstamm** - Produkte und Leistungen mit Bildern, Beschreibungen, Preisen
5. **Angebotserstellung** - Professionelle Angebote mit automatischer Datenübernahme
6. **Logbuch** - Lückenlose Dokumentation aller Aktivitäten
7. **Plantafel** - Ressourcenplanung
8. **Buchhaltung** - Rechnungen, Mahnungen, Zahlungsverfolgung

---

*Erstellt am 27.11.2025 durch Browser-MCP-Analyse*
