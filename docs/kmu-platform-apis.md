# KMU-AIP Plattform & APIs

## 1. API-Strategie
- REST + GraphQL Gateway (`backend/src/routes/index.ts` → Gateway-Service).
- Versionierung: `/api/v1`, `/api/v2`; Deprecation-Policy mit Sunset-Headern.
- Schema-Verwaltung über OpenAPI/AsyncAPI, Docs mit Stoplight/SwaggerUI.
- SDK-Generierung (TypeScript, Python) automatisiert in CI.

## 2. Mandantenfähigkeit
- Datenisolation: Schema pro Mandant oder Mandanten-ID in allen Tabellen.
- Service-Layer prüft Tenant-Context (`backend/src/middleware/tenantContext.ts`).
- Konfigurierbare Features pro Mandant (Feature Flags → LaunchDarkly/Unleash).
- Abrechnung & Nutzungsmetriken (API Usage, Speicher, AI-Aufrufe).

## 3. Deployment & DevOps
- CI/CD-Pipeline (GitHub Actions/GitLab): Build, Tests, Sicherheits-Scans, Deploy.
- Infrastruktur als Code (Terraform + Helm Charts).
- Blue/Green & Canary Deployments, automatisierte Rollbacks.
- Observability: Prometheus/Grafana, OpenTelemetry Traces, strukturiertes Logging.

## 4. Test- & Sandbox-Umgebungen
- Mandanten-spezifische Sandboxes (Staging, QA, Demo).
- Seed-Daten & Synthetic Data Generator (`backend/src/scripts/seedSynthetic.ts`).
- Vertragliche APIs → Mock Server (Prism/Mockoon).
- End-to-End-Tests (Playwright/Cypress) + Contract Tests (Pact).

## 5. Erweiterbarkeit
- Event-Driven Architecture (Kafka/NATS) für Integrationen.
- Webhooks + Event Subscriptions (signierte Payloads).
- Plugin-System: definierte Extension Points (`backend/src/plugins/`).
- App Marketplace Konzept für Drittanbieter.

## 6. Roadmap
1. API-Inventur & Konsolidierung, OpenAPI-Spezifikationen erstellen.
2. Tenant Context Layer und Feature Flagging implementieren.
3. CI/CD-Workflows ausbauen, Observability verankern.
4. Sandbox-/Teststrategie etablieren, Contract Tests automatisieren.
5. Event-/Plugin-Ökosystem schrittweise öffnen.


