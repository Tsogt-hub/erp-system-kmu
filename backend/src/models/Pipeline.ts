// Pipeline-Konfigurationen basierend auf HERO ERP
export interface PipelineStep {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export interface PipelineConfig {
  id: string;
  name: string;
  icon?: string;
  steps: PipelineStep[];
}

// Pipeline-Konfigurationen
export const PIPELINE_CONFIGS: Record<string, PipelineConfig> = {
  general: {
    id: 'general',
    name: 'Projekte',
    icon: '📋',
    steps: [
      { id: 'new_contact', name: 'Neu - Erstkontakt', order: 1 },
      { id: 'on_site_appointment', name: 'Vor-Ort Termin', order: 2 },
      { id: 'offer_creation', name: 'Angebotserstellung', order: 3 },
      { id: 'detailed_discussion', name: 'Detailgespräch', order: 4 },
      { id: 'order_award', name: 'Auftragsvergabe', order: 5 },
      { id: 'order_confirmation', name: 'Auftragsbestätigung', order: 6 },
      { id: 'implementation_start', name: 'Umsetzungsbeginn', order: 7 },
      { id: 'in_implementation', name: 'In Umsetzung', order: 8 },
      { id: 'customer_invoice', name: 'Kundenrechnung', order: 9 },
      { id: 'complaint', name: 'Reklamation', order: 10 },
      { id: 'completed', name: 'Abgeschlossen', order: 11 },
      { id: 'archived', name: 'Archiviert', order: 12 },
    ],
  },
  pv: {
    id: 'pv',
    name: 'PV',
    icon: '☀️',
    steps: [
      { id: 'new_contact', name: 'Neu - Erstkontakt', order: 1 },
      { id: 'on_site_appointment', name: 'Vor-Ort-Termin', order: 2 },
      { id: 'offer_variant', name: 'Angebotsvariante', order: 3 },
      { id: 'offer_creation', name: 'Angebotserstellung', order: 4 },
      { id: 'detailed_discussion', name: 'Detailgespräch', order: 5 },
      { id: 'order_award', name: 'Auftragsvergabe', order: 6 },
      { id: 'order_confirmation', name: 'Auftragsbestätigung', order: 7 },
      { id: 'implementation_start', name: 'Umsetzungsbeginn', order: 8 },
      { id: 'in_implementation', name: 'In Umsetzung', order: 9 },
      { id: 'customer_invoice', name: 'Kundenrechnung', order: 10 },
      { id: 'final_invoice', name: 'Schlussrechnung', order: 11 },
      { id: 'complaint', name: 'Reklamation', order: 12 },
      { id: 'completed', name: 'Abgeschlossen', order: 13 },
      { id: 'archived', name: 'Archiviert', order: 14 },
    ],
  },
  leads: {
    id: 'leads',
    name: '🆕 Leads',
    icon: '🆕',
    steps: [
      { id: 'pre_qualification', name: '🆕 Vorqualifizierung', order: 1 },
      { id: 'not_reached', name: '❌ Nicht erreicht', order: 2 },
      { id: 'waiting_for_feedback', name: '🕑 Warten auf Rückmeldung', order: 3 },
      { id: 'appointment_scheduled', name: '📅 Termin vereinbart', order: 4 },
      { id: 'data_requested', name: '📃 Daten angefordert', order: 5 },
      { id: 'data_complete', name: '✔️ Daten vollständig', order: 6 },
      { id: 'offer_sent', name: '📤 Angebot versendet', order: 7 },
      { id: 'offer_open', name: '🕜 Angebot offen', order: 8 },
      { id: 'offer_signed', name: '✅ Angebot unterschrieben', order: 9 },
      { id: 'archived', name: 'Archiviert', order: 10 },
    ],
  },
  pv_new: {
    id: 'pv_new',
    name: '☀️ PV Neu',
    icon: '☀️',
    steps: [
      { id: 'new_contact', name: 'Neu - Erstkontakt', order: 1 },
      { id: 'on_site_appointment', name: 'Vor-Ort-Termin', order: 2 },
      { id: 'offer_variant', name: 'Angebotsvariante', order: 3 },
      { id: 'offer_creation', name: 'Angebotserstellung', order: 4 },
      { id: 'detailed_discussion', name: 'Detailgespräch', order: 5 },
      { id: 'order_award', name: 'Auftragsvergabe', order: 6 },
      { id: 'order_confirmation', name: 'Auftragsbestätigung', order: 7 },
      { id: 'implementation_start', name: 'Umsetzungsbeginn', order: 8 },
      { id: 'in_implementation', name: 'In Umsetzung', order: 9 },
      { id: 'customer_invoice', name: 'Kundenrechnung', order: 10 },
      { id: 'final_invoice', name: 'Schlussrechnung', order: 11 },
      { id: 'completed', name: 'Abgeschlossen', order: 12 },
      { id: 'archived', name: 'Archiviert', order: 13 },
    ],
  },
  heat_pump: {
    id: 'heat_pump',
    name: '♨️ Wärmepumpen',
    icon: '♨️',
    steps: [
      { id: 'new_contact', name: 'Neu - Erstkontakt', order: 1 },
      { id: 'on_site_appointment', name: 'Vor-Ort-Termin', order: 2 },
      { id: 'offer_creation', name: 'Angebotserstellung', order: 3 },
      { id: 'detailed_discussion', name: 'Detailgespräch', order: 4 },
      { id: 'order_award', name: 'Auftragsvergabe', order: 5 },
      { id: 'order_confirmation', name: 'Auftragsbestätigung', order: 6 },
      { id: 'implementation_start', name: 'Umsetzungsbeginn', order: 7 },
      { id: 'in_implementation', name: 'In Umsetzung', order: 8 },
      { id: 'customer_invoice', name: 'Kundenrechnung', order: 9 },
      { id: 'completed', name: 'Abgeschlossen', order: 10 },
      { id: 'archived', name: 'Archiviert', order: 11 },
    ],
  },
  service: {
    id: 'service',
    name: '🔁 Service / Problemfälle',
    icon: '🔁',
    steps: [
      { id: 'new_ticket', name: 'Neues Ticket', order: 1 },
      { id: 'in_progress', name: 'In Bearbeitung', order: 2 },
      { id: 'waiting_for_parts', name: 'Warten auf Teile', order: 3 },
      { id: 'waiting_for_customer', name: 'Warten auf Kunde', order: 4 },
      { id: 'completed', name: 'Abgeschlossen', order: 5 },
      { id: 'archived', name: 'Archiviert', order: 6 },
    ],
  },
};

export class PipelineModel {
  static getPipelines(): PipelineConfig[] {
    return Object.values(PIPELINE_CONFIGS);
  }

  static getPipelineConfig(type: string): PipelineConfig | null {
    return PIPELINE_CONFIGS[type] || PIPELINE_CONFIGS.general;
  }

  static getAllPipelineConfigs(): PipelineConfig[] {
    return Object.values(PIPELINE_CONFIGS);
  }

  static getStepByName(type: string, stepId: string): PipelineStep | null {
    const config = this.getPipelineConfig(type);
    if (!config) return null;
    return config.steps.find((s) => s.id === stepId) || null;
  }

  static getNextStep(type: string, currentStepId: string): PipelineStep | null {
    const config = this.getPipelineConfig(type);
    if (!config) return null;
    const currentStep = config.steps.find((s) => s.id === currentStepId);
    if (!currentStep) return null;
    return config.steps.find((s) => s.order === currentStep.order + 1) || null;
  }

  static getPreviousStep(type: string, currentStepId: string): PipelineStep | null {
    const config = this.getPipelineConfig(type);
    if (!config) return null;
    const currentStep = config.steps.find((s) => s.id === currentStepId);
    if (!currentStep) return null;
    return config.steps.find((s) => s.order === currentStep.order - 1) || null;
  }
}

