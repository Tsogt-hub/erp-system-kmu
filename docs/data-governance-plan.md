# Implementation Plan: Datenfundament & Governance

## 1. Integrations-Backbone aufsetzen
- Ziel: Einheitliches Eingangsmodul für externe/internal Daten.
- Tasks:
  - `backend/src/integrations/` Ordner anlegen (Basisklassen, Provider-Interfaces, Registry).
  - Konfigurationsschema in `backend/src/config/data-sources.ts`.
  - Beispiel-Connectoren (ERP-DB, CSV Import) implementieren.
  - Unit-Tests für Registry & Config-Loading.

## 2. Pipeline-Orchestrierung vorbereiten
- Ziel: ETL-Flows strukturieren und Monitoring-Hooks anlegen.
- Tasks:
  - `backend/src/pipelines/` mit Job-Definitionen (Raw → Staging → Curated).
  - Scheduler-Stubs (z. B. BullMQ/Agenda) in `backend/src/jobs/`.
  - Logging & Error-Handling über `logger`.
  - CLI-Skripte für manuelle Pipeline-Läufe (`backend/src/scripts/run-pipeline.ts`).

## 3. Metadaten & Data-Quality Layer
- Ziel: Dateninventar, Lineage & Qualitätsregeln beschreiben.
- Tasks:
  - `backend/src/metadata/` Service mit CRUD für Data Assets & DQ-Regeln.
  - Modelle `DataAsset`, `DataQualityRule`.
  - REST-Routen `/api/metadata/*`.
  - Frontend-Placeholder-Page `frontend/src/pages/data-quality`.

## 4. RBAC/ABAC Sicherheitslayer
- Ziel: Feingranulare Zugriffskontrolle für APIs.
- Tasks:
  - `backend/src/auth` Module (Role definitions, Attribute evaluators).
  - Middleware `accessGuard` mit Policy Evaluation.
  - Erweiterung Auth-Service (Token Claims mit Rollen/Attributen).
  - Tests für Policy-Matrix.

## 5. Audit & Compliance
- Ziel: Nachvollziehbarkeit und Policy-Enforcement.
- Tasks:
  - Modell `AuditLog`, Service & Route `/api/audit`.
  - Events: Login, Datenabruf, Export, Policy Decision.
  - Consent-/Retention-Konfiguration (`backend/src/config/privacy.ts`).
  - Export-Schnittstellen (z. B. syslog/SIEM Stub).


