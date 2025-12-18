# KMU-AIP Operative Workspaces & Kollaboration

## 1. Leitprinzipien
- Einheitliche UX nach „Hero“-Design (klare Raster, Fokus auf KPIs).
- Kontextbezogene Zusammenarbeit zwischen Teams (Projekt, Service, Einkauf, Vertrieb).
- Transparente Nachvollziehbarkeit von Entscheidungen und Aktionen.

## 2. Workspace-Typen
1. **Plantafel & Kalender**
   - Ressourcenplanung, Drag-&-Drop, Szenariovergleich.
   - Zeitachsen mit Live-Status (Fortschritt, Abhängigkeiten).
   - Integration AI-Empfehlungen (z. B. Umbuchung bei Engpässen).
2. **Operations Command Center**
   - Ticket-Queue, Wartungsalarme, IoT-Sensor-Streams.
   - Priorisierung nach SLA, Eskalationen, Routenplanung.
3. **Projektcockpit**
   - Überblick Angebote → Projekte → Rechnungen.
   - Digitale Akte (Dokumente, Fotos, Messwerte).
   - Kosten-/Leistungstracking, Earned Value Analyse.
4. **Supply & Einkauf**
   - Lieferstatus, Lagerbestände, offene Bestellungen.
   - Supplier Scorecards, Risikoindikatoren.

## 3. UI-/UX-Bausteine
- `frontend/src/components/workspace/LayoutShell.tsx`: Sticky-Header, Split-View, KPI-Badges.
- `frontend/src/components/workspace/TimelineBoard.tsx`: Flex/Grid-Struktur, Item-Karten, Zoom-Level.
- Kollaborationsleisten (Chat, Kommentare, Aufgabenliste).
- Ereignis-Ticker & Alerts (via `frontend/src/components/alerts/LiveFeed.tsx`).

## 4. Workflow-Orchestrierung
- State Machine/Workflow Engine (`backend/src/workflows/engine.ts`).
- Schrittketten: Lead → Angebot → Projekt → Montage → Abnahme → Service.
- Trigger & Actions:
  - Manuelle Aktionen: Button → Task Creation.
  - Automatisierte Aktionen: Sensor-Alarme, AI-Empfehlungen.
- Integration mit Policy-Engine (Freigaben, Eskalationen).

## 5. Kollaboration & Kommunikation
- Kommentarfunktion mit @Mentions, Dateianhänge (`frontend/src/components/collab/CommentThread.tsx`).
- Echtzeit-Sync via WebSockets/WebRTC (`backend/src/services/realtime`).
- Aktivitäts-Feeds je Objekt (Projekt, Asset).
- Wissenshub: SOPs, Checklisten, AI-generierte Handlungsempfehlungen.

## 6. Digital Twin & Visualisierung
- Asset-Graphen (Anlage → Komponenten → Sensoren).
- Geografische Karten (Leaflet/Mapbox) für Einsatzplanung.
- 3D/2D-Anlagenlayouts (PV-Module, Dachflächen).
- KPI-Dashboards mit Drilldowns (PowerBI Embedded/Metabase).

## 7. Umsetzungsschritte
1. UX-Designsystem erweitern (Hero-Komponenten, Dark/Light).
2. Workspace-Layout-Framework entwickeln.
3. Workflow-Engine + API spezifizieren.
4. Kollaborationsdienste (Kommentare, Aufgaben, Benachrichtigungen) implementieren.
5. Digital-Twin-Visualisierung iterativ einführen.
6. Nutzerfeedback-Zyklen & Telemetrie etablieren.


