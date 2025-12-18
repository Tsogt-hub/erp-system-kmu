# KMU-AIP Governance & Sicherheit

## 1. Zielsetzung
- Schutz sensibler Betriebs-, Kunden- und Energiedaten.
- Durchsetzung regulatorischer Vorgaben (DSGVO, EEG, Lieferkettengesetz).
- Ermöglichung vertrauenswürdiger Datenfreigabe für KI-gestützte Workflows.

## 2. Rollen- und Berechtigungsmodell
- **Rollenhierarchie**: Administrator, Operationsleiter, Projektleiter, Monteur, Vertrieb, Finance, Partner.
- **Attribute**: Standort, Gewerke-Skill, Projektzugehörigkeit, Mandant.
- Umsetzung:
  - `backend/src/auth/acl.ts`: Policy-Definitionen (RBAC + ABAC).
  - `backend/src/middleware/accessGuard.ts`: Enforcement an Routen.
  - `frontend/src/store/authSlice.ts`: Claims + Feature Flags.
- Delegierte Administration & Rezertifizierung über Self-Service-Konsole (`frontend/src/pages/admin/access`).

## 3. Datenzugriff & Auditing
- Zugriffsebenen: Rohdaten, kuratierte Daten, aggregierte Dashboards.
- Row- & Column-Level Security (PostgreSQL RLS, ClickHouse Views).
- Audit-Log:
  - Persistenz `backend/src/models/AuditLog.ts`.
  - Ereignisse: Login, Datenexport, Policy-Änderung, AI-Empfehlung angenommen/abgelehnt.
  - Exporte an SIEM (Elastic/Splunk).

## 4. Datenschutz & Compliance
- Datenschutz-Folgenabschätzung dokumentieren (`docs/privacy/`).
- Consent-Management für Kundendaten (API + UI-Dialoge).
- Aufbewahrungs- & Löschkonzepte, Data Subject Requests automatisieren.
- Verschlüsselung:
  - Transport: TLS mTLS zwischen Services.
  - Speicherung: Datenbank TDE, S3 SSE-KMS, Secrets via HashiCorp Vault.

## 5. Sicherheitsprozesse
- Threat Modeling (STRIDE) pro Modul.
- Security Testing Pipeline: SAST (Semgrep), DAST (OWASP ZAP), Dependency Scans (npm audit).
- Incident Response Playbooks & Runbooks (`docs/security/`).
- Zero-Trust-Netzwerk: Service Mesh (Istio/Linkerd) mit Policy Enforcement.

## 6. Richtlinien-Engine
- Policy-as-Code (Open Policy Agent) für Zugriff, Datenexport, Modellfreigaben.
- Regelsets:
  - Zugriff nur für aktive Projekte.
  - Export sensibler Daten nur nach 4-Augen-Freigabe.
  - AI-Aktionen → menschliche Bestätigung bei kritischen Vorgängen.
- Verwaltung über `backend/src/services/policy.service.ts` + Admin-UI.

## 7. Roadmap
1. Rollen-/Attribute-Analyse & Matrix erstellen.
2. RBAC/ABAC-Layer implementieren, Tests schreiben.
3. Audit-Log-Service & UI-Dashboards ausrollen.
4. Datenschutzprozesse automatisieren, Schulungen durchführen.
5. OPA-Policies integrieren, kontinuierliche Reviews etablieren.


