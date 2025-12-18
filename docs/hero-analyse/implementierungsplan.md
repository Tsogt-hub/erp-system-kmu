# Implementierungsplan für Elite ERP

## Basierend auf Hero-Analyse vom 27.11.2025

---

## Phase 1: Bereits implementiert ✅

### 1.1 Artikelstamm-Erweiterungen
- [x] Einkaufspreis (EK) Feld
- [x] Verkaufspreis (VK) Feld
- [x] Automatische Marge-Berechnung
- [x] Marge-Anzeige (Chip mit Farbe)
- [x] PV-spezifische Kategorien
- [x] Hersteller-Feld
- [x] Artikelbild-URL
- [x] Artikelsuche mit Filter

### 1.2 Angebotserstellung
- [x] Marge-Progressbar pro Position
- [x] Artikel-Sidebar rechts
- [x] Artikelsuche mit Kategorien
- [x] Schnellauswahl aus Artikelstamm
- [x] Summenblock mit EK/Aufschlag
- [x] Standard-Einleitungstext
- [x] Standard-Zahlungsbedingungen
- [x] PDF-Download Button
- [x] Duplizieren-Funktion
- [x] Status-Workflow (Entwurf → Versendet → Angenommen)

### 1.3 Logbuch-System
- [x] Backend-Model für LogEntry
- [x] API-Endpoints (POST, GET)
- [x] LogbookPanel-Komponente
- [x] Integration in Projektdetails
- [x] Integration in Kontaktdetails
- [x] Aktionstypen (Notiz, Anruf, E-Mail, Termin, etc.)
- [x] Filter nach Aktionstyp
- [x] Benutzer-Zuordnung

---

## Phase 2: Nächste Prioritäten (HOCH)

### 2.1 ✅ Logbuch-System - ABGESCHLOSSEN

### 2.2 Lead-Quelle Tracking
**Ziel**: Erfassen woher Kontakte kommen
**Aufwand**: 1 Tag

```typescript
// Kontakt-Erweiterung (Backend + Frontend)
interface Contact {
  // ... bestehende Felder
  source: string; // Lead-Quelle
  reachability: string; // Erreichbarkeit
}

// Dropdown-Optionen
const LEAD_SOURCES = [
  'E-Mail',
  'Persönlicher Kontakt',
  'Messe',
  'Social Media',
  'Online-Portal',
  'Telefon',
  'Eigene Webseite',
  'Empfehlung',
  'Bestandskunde',
  'Außenwerbung',
  'Netzwerk',
  'Interessent',
  'Flyer / Prospekt',
  'Fahrzeugwerbung',
];

const REACHABILITY = [
  'Vormittags',
  'Nachmittags',
  'Abends',
  'Ganztags',
  'Nur am Wochenende',
  'ausschließlich per E-Mail',
  'Sonstige',
];
```

**Tasks:**
- [ ] Backend: Contact-Model erweitern (source, reachability)
- [ ] Backend: Migration für neue Spalten
- [ ] Frontend: CRM-Formular erweitern
- [ ] Frontend: Kontaktdetails anpassen
- [ ] Frontend: Filter in Kontaktliste

### 2.3 Erinnerung/Wiedervorlage
**Ziel**: Termine für Follow-ups setzen
**Aufwand**: 2 Tage

```typescript
// Projekt-Erweiterung
interface Project {
  // ... bestehende Felder
  reminder_date?: Date;
  reminder_note?: string;
}

// Dashboard-Widget
- Überfällige Erinnerungen anzeigen
- Quick-Actions für Wiedervorlage
```

**Tasks:**
- [ ] Backend: Project-Model erweitern
- [ ] Backend: Reminder-API erstellen
- [ ] Frontend: Reminder-Dialog in Projektdetails
- [ ] Frontend: Dashboard-Widget für überfällige Erinnerungen
- [ ] Frontend: Kalender-Integration

### 2.4 Vorlagen-System
**Ziel**: Wiederverwendbare Angebotsvorlagen
**Aufwand**: 4 Tage

```typescript
// models/OfferTemplate.ts
interface OfferTemplate {
  id: number;
  name: string;
  description?: string;
  intro_text: string;
  footer_text: string;
  payment_terms: string;
  default_items: OfferTemplateItem[];
  created_at: Date;
  updated_at: Date;
}

interface OfferTemplateItem {
  id: number;
  template_id: number;
  item_id: number;
  quantity: number;
  position_order: number;
}
```

**Tasks:**
- [ ] Backend: OfferTemplate-Model erstellen
- [ ] Backend: CRUD-Endpoints
- [ ] Frontend: Vorlagen-Verwaltungsseite
- [ ] Frontend: "Aus Vorlage erstellen" Button
- [ ] Frontend: "Als Vorlage speichern" Funktion

### 2.5 E-Mail-Versand
**Ziel**: Dokumente direkt per E-Mail versenden
**Aufwand**: 3 Tage

```typescript
// Backend: services/email.service.ts
interface EmailService {
  sendDocument(
    documentId: number,
    recipientEmail: string,
    subject: string,
    body: string
  ): Promise<void>;
}

// Integration mit:
- SMTP (einfach)
- SendGrid (professionell)
- Postmark (transaktional)
```

**Tasks:**
- [ ] Backend: E-Mail-Service implementieren
- [ ] Backend: E-Mail-Vorlagen
- [ ] Backend: Attachment-Handling
- [ ] Frontend: "Per E-Mail senden" Button
- [ ] Frontend: E-Mail-Vorschau Dialog
- [ ] Frontend: Empfänger-Auswahl

---

## Phase 3: Dokumenttypen erweitern (KRITISCH)

### 3.1 Auftragsbestätigung
**Aufwand**: 2 Tage

```typescript
// Aus Angebot generieren
interface OrderConfirmation extends BaseDocument {
  type: 'order_confirmation';
  number_prefix: 'AB';
  source_offer_id: number;
}
```

**Tasks:**
- [ ] Backend: OrderConfirmation-Model
- [ ] Backend: "Aus Angebot erstellen" Endpoint
- [ ] Frontend: AB-Erstellung aus Angebot
- [ ] Frontend: AB-Bearbeitung

### 3.2 Materialliste
**Aufwand**: 1 Tag

```typescript
// Aus Angebot/Auftrag generieren
interface MaterialList extends BaseDocument {
  type: 'material_list';
  number_prefix: 'ML';
  source_document_id: number;
  // Nur Artikel, keine Leistungen
}
```

**Tasks:**
- [ ] Backend: MaterialList-Model
- [ ] Backend: Artikel-Filter (nur physische Produkte)
- [ ] Frontend: ML-Generierung
- [ ] Frontend: ML-Ansicht

### 3.3 Rechnung
**Aufwand**: 3 Tage

```typescript
interface Invoice extends BaseDocument {
  type: 'invoice' | 'partial_invoice' | 'final_invoice';
  number_prefix: 'RE';
  source_order_id: number;
  payment_status: 'open' | 'partial' | 'paid' | 'overdue';
  due_date: Date;
  paid_amount: number;
}
```

**Tasks:**
- [ ] Backend: Invoice-Model
- [ ] Backend: Zahlungsstatus-Tracking
- [ ] Backend: Fälligkeitsberechnung
- [ ] Frontend: Rechnung erstellen
- [ ] Frontend: Zahlungseingang buchen
- [ ] Frontend: Offene-Posten-Liste

### 3.4 Mahnung
**Aufwand**: 1 Tag

```typescript
interface Reminder extends BaseDocument {
  type: 'payment_reminder' | 'dunning_1' | 'dunning_2' | 'dunning_3';
  number_prefix: 'M';
  source_invoice_id: number;
  dunning_level: 1 | 2 | 3;
  dunning_fee: number;
}
```

**Tasks:**
- [ ] Backend: Reminder-Model
- [ ] Backend: Mahnstufen-Logik
- [ ] Frontend: Mahnung erstellen
- [ ] Frontend: Automatische Mahngebühren

### 3.5 Lieferschein
**Aufwand**: 1 Tag

```typescript
interface DeliveryNote extends BaseDocument {
  type: 'delivery_note';
  number_prefix: 'LS';
  source_order_id: number;
  delivered_items: DeliveredItem[];
}
```

**Tasks:**
- [ ] Backend: DeliveryNote-Model
- [ ] Backend: Teillieferung-Logik
- [ ] Frontend: Lieferschein erstellen
- [ ] Frontend: Mengen anpassen

---

## Phase 4: Angebotserstellung verbessern

### 4.1 Artikelbilder in Positionen
**Aufwand**: 2 Tage

**Tasks:**
- [ ] Frontend: Thumbnail-Anzeige pro Position
- [ ] Frontend: Bild aus Artikelstamm übernehmen
- [ ] Frontend: Bild-Upload pro Position
- [ ] Backend: Position-Bild-Feld

### 4.2 Bedarfs-/Alternative Positionen
**Aufwand**: 2 Tage

```typescript
interface OfferItem {
  // ... bestehende Felder
  position_type: 'standard' | 'optional' | 'alternative';
}
```

**Tasks:**
- [ ] Backend: position_type Feld
- [ ] Frontend: Positionstyp-Auswahl
- [ ] Frontend: Separate Berechnung im Summenblock
- [ ] Frontend: Visuelle Unterscheidung (Klammern)

### 4.3 Drag & Drop Positionen
**Aufwand**: 1 Tag

**Tasks:**
- [ ] Frontend: react-beautiful-dnd oder dnd-kit
- [ ] Frontend: Sortierung speichern
- [ ] Backend: Position-Reihenfolge-Feld

### 4.4 PDF-Vorschau
**Aufwand**: 2 Tage

**Tasks:**
- [ ] Backend: PDF-Generierung mit Puppeteer/html-pdf
- [ ] Frontend: Live-Vorschau im Browser
- [ ] Frontend: Vorschau-Tab in Angebotseditor

### 4.5 Rich-Text-Editor Verbesserungen
**Aufwand**: 2 Tage

**Tasks:**
- [ ] Frontend: TipTap oder Quill.js integrieren
- [ ] Frontend: Formatierungstools wie Hero
- [ ] Frontend: Bild-Upload in Text
- [ ] Frontend: Tabellen-Support

---

## Phase 5: PV-spezifische Erweiterungen

### 5.1 Datenerfassungsbogen
**Aufwand**: 3 Tage

```typescript
// models/PVProjectData.ts
interface PVProjectData {
  project_id: number;
  
  // Zeitplan
  planned_start: string;
  start_notes?: string;
  
  // Gebäude
  building_age_class?: string;
  building_type?: string;
  residents_count?: number;
  ownership?: string;
  
  // Energetischer Zustand
  completed_renovations?: string[];
  planned_renovations?: string[];
  annual_consumption_kwh?: number;
  annual_costs_eur?: number;
  
  // Dach
  roof_type?: string;
  roof_age?: string;
  roof_area_m2?: number;
  roof_material?: string;
  roof_orientation?: string;
  roof_angle?: string;
  
  // Gewünschte PV
  interest_wallbox?: string;
  existing_pv?: boolean;
  desired_kwp?: number;
  available_area_m2?: number;
  installation_location?: string;
  interest_storage?: string;
  desired_storage_kwh?: number;
}
```

**Tasks:**
- [ ] Backend: PVProjectData-Model
- [ ] Frontend: Datenerfassungs-Tab in Projektdetails
- [ ] Frontend: Formular mit Sections
- [ ] Frontend: Validierung

### 5.2 Gewerk-Kategorien
**Aufwand**: 1 Tag

```typescript
const PROJECT_TYPES = [
  { code: 'PV', label: 'Photovoltaik', emoji: '☀️' },
  { code: 'WP', label: 'Wärmepumpe', emoji: '♨️' },
  { code: 'SERVICE', label: 'Service / Problemfälle', emoji: '🔁' },
  { code: 'LEAD', label: 'Lead', emoji: '🆕' },
];
```

**Tasks:**
- [ ] Backend: project_type Feld
- [ ] Frontend: Gewerk-Auswahl bei Projekterstellung
- [ ] Frontend: Filter in Projektliste
- [ ] Frontend: Sidebar-Untermenüs

---

## Phase 6: Zusatzfunktionen

### 6.1 CRM-Erweiterungen
**Aufwand**: 2 Tage

**Tasks:**
- [ ] Anrede-Feld (Dropdown)
- [ ] Rechnungsempfänger-Flag
- [ ] Bilder pro Kontakt (Galerie)
- [ ] Dokumente pro Kontakt
- [ ] Notizen-Feld erweitern

### 6.2 Buchhaltung (Grundfunktionen)
**Aufwand**: 3 Tage

**Tasks:**
- [ ] Offene-Posten-Liste
- [ ] Zahlungseingänge buchen
- [ ] Überfällige Rechnungen
- [ ] Einfache Statistiken

### 6.3 Checklisten
**Aufwand**: 2 Tage

**Tasks:**
- [ ] Backend: Checklist-Model
- [ ] Frontend: Checklisten-Vorlagen
- [ ] Frontend: Projekt-spezifische Listen
- [ ] Frontend: Abhaken mit Zeitstempel

---

## Technische Anforderungen

### Backend-Erweiterungen

```bash
# Neue Tabellen
- offer_templates
- offer_template_items
- pv_project_data
- reminders
- email_logs
- invoices
- order_confirmations
- material_lists
- delivery_notes
- dunnings
- checklists
- checklist_items

# Neue Endpoints
POST /api/offer-templates
GET /api/offer-templates
POST /api/offers/:id/from-template
POST /api/documents/:id/send-email
GET /api/reminders/overdue
POST /api/invoices
POST /api/invoices/:id/payment
GET /api/invoices/open
POST /api/order-confirmations/from-offer/:offerId
POST /api/material-lists/from-document/:documentId
```

### Frontend-Erweiterungen

```bash
# Neue Komponenten
- components/ReminderWidget.tsx
- components/TemplateSelector.tsx
- components/EmailDialog.tsx
- components/PDFPreview.tsx
- components/RichTextEditor.tsx
- components/DraggablePositionList.tsx
- components/ImageGallery.tsx

# Neue Seiten
- pages/OfferTemplates.tsx
- pages/PVProjectData.tsx
- pages/Invoices.tsx
- pages/OpenItems.tsx
- pages/Accounting.tsx
```

---

## Zeitplan (geschätzt)

| Phase | Aufwand | Priorität | Status |
|-------|---------|-----------|--------|
| Phase 1 (Basis) | - | Hoch | ✅ Abgeschlossen |
| Phase 2.1 Logbuch | 3 Tage | Hoch | ✅ Abgeschlossen |
| Phase 2.2 Lead-Quelle | 1 Tag | Hoch | ⏳ Ausstehend |
| Phase 2.3 Erinnerung | 2 Tage | Hoch | ⏳ Ausstehend |
| Phase 2.4 Vorlagen | 4 Tage | Hoch | ⏳ Ausstehend |
| Phase 2.5 E-Mail | 3 Tage | Hoch | ⏳ Ausstehend |
| Phase 3 Dokumente | 8 Tage | Kritisch | ⏳ Ausstehend |
| Phase 4 Angebote | 9 Tage | Hoch | ⏳ Ausstehend |
| Phase 5 PV-spezifisch | 4 Tage | Mittel | ⏳ Ausstehend |
| Phase 6 Zusatz | 7 Tage | Niedrig | ⏳ Ausstehend |

**Gesamt**: ~38 Arbeitstage für vollständige Hero-Parität

---

## Nächster Schritt

Fortfahren mit **Phase 2.2 Lead-Quelle Tracking**:
1. Backend: Contact-Model erweitern
2. Frontend: CRM-Formular anpassen
3. Frontend: Filter implementieren

---

*Aktualisiert am 27.11.2025*
