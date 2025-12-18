# KMU-AIP Datenfundament

## 1. Ausgangslage
- Bestehende Quellen: `backend/src/models` (SQL-Tabellen für Nutzer, Projekte, CRM, Inventar), ERP-Frontend-Formulare, CSV-Importe aus `scripts/`.
- Technologien: Express-Services, SQLite (lokal), geplante PostgreSQL-Instanz, MUI-Frontend.

## 2. Zielbild Datenlandschaft
- Zentraler Data Lake (Objektspeicher) für Rohdaten, Data Warehouse (z. B. PostgreSQL/BigQuery) für kuratierte Views.
- Einheitliche Schemas (JSON-Schema/Protobuf) und Versionierung.
- Datenklassifizierung (öffentlich, intern, sensibel) + Tagging.

## 3. Integrations-Roadmap
1. **PV-Planung & Sensorik**
   - APIs: PVSol, PV*Sol, SolarEdge, Wechselrichter (Modbus/MQTT).
   - Streaming über `backend/src/integrations/pv/` → Kafka/Redpanda → Warehouse.
2. **Betriebsführung**
   - ERP-Formulare, Zeiterfassung, Tickets (`backend/src/controllers/*`).
   - Batch-ETL via Airbyte/Fivetran/Custom.
3. **Finanzen & Einkauf**
   - DATEV, Lexware, SAP Business One, Lieferantenportale (EDI/REST).
   - Tägliche Synchronisierung, Fact- und Dimension-Modelle.
4. **Externe Daten**
   - Wetter (DWD, Meteonomiqs), Energiepreise (EEX), Netzdaten.
   - Geodaten (OpenStreetMap) für Standortanalysen.

## 4. Pipeline-Design
- Orchestrierung: Dagster/Airflow (`infrastructure/pipelines/`).
- ETL-Schichten: Raw → Staging → Curated → Serving.
- Schemapflege & Tests (Great Expectations / dbt tests).
- Fehlerhandling: Dead Letter Queue, Alerts (PagerDuty/Slack).

## 5. Metadaten & Data Quality
- Data Catalog (OpenMetadata/Amundsen) mit UI im Admin-Portal.
- Lineage-Tracking (Marquez/OpenLineage) pro Job.
- Datenqualitätsregeln:
  - Vollständigkeit (Pflichtfelder, Null-Anteil).
  - Konsistenz (Referenzen, Plausibilitäten).
  - Aktualität (SLA pro Quelle).
- Automatische Reports in `frontend/src/pages/data-quality`.

## 6. Infrastruktur & Sicherheit
- Cloud-agnostisches Deployment (Kubernetes, Helm Charts).
- Secrets-Verwaltung (Vault/SOPS), Verschlüsselung auf Transport- & Speicherebene.
- Zugriffsschichten:
  - Rohdaten: Nur Integrations-Services.
  - Kuratiert: Analysten, AI-Services.
  - Serving: Fachanwendungen (Plantafel, Dashboard).

## 7. Implementierungsschritte
1. Dateninventur-Workshop & Glossar erstellen.
2. MVP-Integrationen: Projekte, Zeitbuchungen, Inventar.
3. Data Lake + Warehouse bereitstellen.
4. Metadaten-Stack aufsetzen, Qualitätsregeln definieren.
5. Monitoring/Dashboards implementieren.
6. Automatisierte Tests & CI/CD für Pipelines.


