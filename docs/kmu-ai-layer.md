# KMU-AIP AI- & Entscheidungsdienste

## 1. Use-Case-Priorisierung
1. Kapazitäts- & Ressourcenprognosen (Monteure, Material, Fahrzeuge).
2. Angebots- & Preisoptimierung (PV-Anlagen, Speicher, Wartung).
3. Wartungs- & Störungsmeldungen (Predictive Maintenance).
4. Risiko-Scoring (Lieferketten, Wetter, Projektverzug).
5. Dokumenten-Assistenz (Vertragsanalyse, Rechnungsabgleich).

## 2. Architekturkomponenten
- **Feature Store**: Historische Zeitreihen, Projektdaten (`backend/src/services/analytics/`).
- **ML-Workloads**: 
  - Forecasting (Prophet, SKTime) → Batch Jobs.
  - Echtzeit-Inferenz (FastAPI/Express Microservice).
- **LLM-Schicht**:
  - Retrieval-Augmented Generation (`backend/src/ai/rag.service.ts`).
  - Wissensbasen: Projektdokumente, SOPs (`docs/operations/`).
  - Guardrails (LangChain/Guardrails.ai) + Policy Hooks.
- **Scenario Engine**:
  - Was-wäre-wenn-Simulationen (`backend/src/ai/scenario.service.ts`).
  - Monte-Carlo-Analysen für Wetter- und Lieferkettenrisiken.

## 3. Datenflüsse
1. Kuratierte Daten aus Data Warehouse → Feature Store (Feathr/Tecton).
2. Trainingspipelines (MLflow + Kubeflow Pipelines).
3. Modellregistrierung + Versionsverwaltung.
4. Inferenz-API → Frontend-Komponenten (`frontend/src/pages/planning`, `frontend/src/pages/dashboard`).

## 4. Steuerung & Guardrails
- **Consistent Prompting**: Standard-Prompt-Vorlagen (`backend/src/ai/prompts/`).
- **Policy Checks**: OPA-Hooks vor Ausführung von AI-Aktionen.
- **Human-in-the-loop**: UI-Komponente für Genehmigungen (`frontend/src/components/ai/ActionApproval.tsx`).
- **Monitoring**:
  - Drift-Erkennung (Evidently, WhyLabs).
  - Feedback-Widget im Frontend (Thumbs Up/Down + Kommentar).
  - Audit-Trail für AI-Empfehlungen.

## 5. Betriebsprozesse
- MLOps-Governance: CI/CD für Modelle, Canary Deployments.
- Runde Reviews: AI-Ethikboard, Model Cards, Risikoanalysen.
- Schulungen & Dokumentation für Endanwender.

## 6. Roadmap
1. Use-Cases final validieren, KPIs definieren.
2. Feature Store + MLflow initialisieren.
3. MVP-Modelle für Kapazität & Angebot implementieren.
4. LLM-RAG-Prototyp für Projektwissen ausrollen.
5. Guardrails & Monitoring aufbauen.
6. Skalierung auf weitere Prozesse (Einkauf, Service).


