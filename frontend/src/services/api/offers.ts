import { apiClient } from './client';

export interface Offer {
  id: number;
  offer_number: string;
  project_id?: number;
  customer_id?: number;
  amount: number;
  tax_rate: number;
  status: string;
  valid_until?: string;
  notes?: string;
  intro_text?: string; // Einleitungstext (Rich-Text)
  footer_text?: string; // Fußtext (Rich-Text)
  payment_terms?: string; // Zahlungsbedingungen
  discount_amount?: number; // Gesamtrabatt
  discount_percent?: number; // Gesamtrabatt in %
  created_by: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  project_name?: string;
  project_address?: string;
  created_user_name?: string;
  items?: OfferItem[];
}

// Position-Typen wie in Hero
export const OFFER_ITEM_TYPES = [
  { value: 'standard', label: 'Standard', color: '#2196F3', icon: '📦' },
  { value: 'optional', label: 'Bedarfsposition', color: '#FF9800', icon: '❓' },
  { value: 'alternative', label: 'Alternative', color: '#9C27B0', icon: '🔄' },
  { value: 'header', label: 'Überschrift', color: '#607D8B', icon: '📋' },
  { value: 'text', label: 'Freitext', color: '#795548', icon: '📝' },
];

export interface OfferItem {
  id: number;
  offer_id: number;
  item_id?: number;
  position_number?: string; // z.B. "0.001", "0.002"
  description: string;
  long_description?: string; // Ausführliche Beschreibung
  features?: string[]; // Feature-Liste
  quantity: number;
  unit: string;
  unit_price: number; // Verkaufspreis (VK)
  purchase_price?: number; // Einkaufspreis (EK)
  discount_percent?: number;
  tax_rate: number;
  position_order: number;
  image_url?: string;
  // Neue Hero-Felder
  item_type: string; // standard, optional, alternative, header, text
  parent_item_id?: number; // Für Gruppen/Alternativen
  notes?: string; // Interne Notizen
  is_visible: boolean; // Sichtbar im Angebot
  created_at: string;
  updated_at: string;
  item_name?: string;
  item_sku?: string;
  // Berechnete Felder
  margin_percent?: number; // Marge in %
  margin_amount?: number; // Marge in €
  total_net?: number; // Netto-Gesamt
  total_gross?: number; // Brutto-Gesamt
}

export interface CreateOfferItemData {
  offer_id: number;
  item_id?: number;
  position_number?: string;
  description: string;
  long_description?: string;
  features?: string[];
  quantity: number;
  unit: string;
  unit_price: number;
  purchase_price?: number;
  discount_percent?: number;
  tax_rate?: number;
  image_url?: string;
  // Neue Hero-Felder
  item_type?: string;
  parent_item_id?: number;
  notes?: string;
  is_visible?: boolean;
}

export interface CreateOfferData {
  project_id?: number;
  customer_id?: number;
  amount: number;
  tax_rate?: number;
  status?: string;
  valid_until?: string;
  notes?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  discount_amount?: number;
  discount_percent?: number;
}

// Berechnet die Marge für eine Position
export function calculateItemMargin(item: OfferItem): { marginPercent: number; marginAmount: number } {
  if (!item.purchase_price || item.purchase_price === 0) {
    return { marginPercent: 0, marginAmount: 0 };
  }
  const marginAmount = (item.unit_price - item.purchase_price) * item.quantity;
  const marginPercent = ((item.unit_price - item.purchase_price) / item.purchase_price) * 100;
  return { marginPercent, marginAmount };
}

// Berechnet den Netto-Gesamtbetrag einer Position
export function calculateItemNetTotal(item: OfferItem): number {
  // Optional und Alternative Positionen werden nicht in die Summe einbezogen
  if (item.item_type === 'optional' || item.item_type === 'alternative' || 
      item.item_type === 'header' || item.item_type === 'text') {
    return 0;
  }
  const subtotal = item.quantity * item.unit_price;
  const discount = item.discount_percent ? (subtotal * item.discount_percent / 100) : 0;
  return subtotal - discount;
}

// Berechnet den Brutto-Gesamtbetrag einer Position
export function calculateItemGrossTotal(item: OfferItem): number {
  const netTotal = calculateItemNetTotal(item);
  return netTotal * (1 + item.tax_rate / 100);
}

// Berechnet den Anzeigewert (auch für optional/alternative)
export function calculateItemDisplayTotal(item: OfferItem): number {
  const subtotal = item.quantity * item.unit_price;
  const discount = item.discount_percent ? (subtotal * item.discount_percent / 100) : 0;
  return subtotal - discount;
}

// Prüft ob eine Position in die Summe einbezogen wird
export function isItemIncludedInTotal(item: OfferItem): boolean {
  return item.item_type === 'standard' || !item.item_type;
}

// Gibt das Label für den Positionstyp zurück
export function getItemTypeLabel(itemType: string): string {
  const type = OFFER_ITEM_TYPES.find(t => t.value === itemType);
  return type?.label || 'Standard';
}

// Gibt die Farbe für den Positionstyp zurück
export function getItemTypeColor(itemType: string): string {
  const type = OFFER_ITEM_TYPES.find(t => t.value === itemType);
  return type?.color || '#2196F3';
}

// Gibt das Icon für den Positionstyp zurück
export function getItemTypeIcon(itemType: string): string {
  const type = OFFER_ITEM_TYPES.find(t => t.value === itemType);
  return type?.icon || '📦';
}

// Standard-Einleitungstext
export const DEFAULT_INTRO_TEXT = `Sehr geehrte Damen und Herren,

wir bedanken uns für Ihre Anfrage und bieten Ihnen unser freibleibendes Angebot nachfolgend an:`;

// Standard-Zahlungsbedingungen
export const DEFAULT_PAYMENT_TERMS = `Als Zahlungsbedingungen werden vereinbart:

50% der Auftragssumme bei Auftragserteilung
50% der Auftragssumme bei Fertigstellung vor Inbetriebnahme durch den Netzbetreiber

oder

1,5% Skonto nur bei 90% der Auftragssumme bei Auftragserteilung
10% der Auftragssumme bei Fertigstellung vor Inbetriebnahme durch den Netzbetreiber`;

export const offersApi = {
  getAll: async (status?: string): Promise<Offer[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/offers', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Offer> => {
    const response = await apiClient.get(`/offers/${id}`);
    return response.data;
  },

  getByProject: async (projectId: number): Promise<Offer[]> => {
    const response = await apiClient.get(`/offers/project/${projectId}`);
    return response.data;
  },

  create: async (data: CreateOfferData): Promise<Offer> => {
    const response = await apiClient.post('/offers', data);
    return response.data;
  },

  createForProject: async (projectId: number): Promise<Offer> => {
    const response = await apiClient.post(`/offers/project/${projectId}`);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateOfferData>): Promise<Offer> => {
    const response = await apiClient.put(`/offers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/offers/${id}`);
  },

  // Status ändern
  updateStatus: async (id: number, status: string): Promise<Offer> => {
    const response = await apiClient.patch(`/offers/${id}/status`, { status });
    return response.data;
  },

  // PDF generieren
  generatePdf: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/offers/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // PDF-Vorschau als Base64 abrufen
  previewPdf: async (id: number): Promise<string> => {
    const response = await apiClient.post(`/offers/${id}/preview-pdf`);
    return response.data.pdf;
  },

  // PDF herunterladen
  downloadPdf: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/offers/${id}/download-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Angebot finalisieren (offizielle Nummer vergeben)
  finalize: async (id: number): Promise<Offer> => {
    const response = await apiClient.post(`/offers/${id}/finalize`);
    return response.data;
  },

  // Angebot duplizieren
  duplicate: async (id: number): Promise<Offer> => {
    const response = await apiClient.post(`/offers/${id}/duplicate`);
    return response.data;
  },

  // Angebot in Rechnung umwandeln
  convertToInvoice: async (id: number): Promise<{ invoice_id: number }> => {
    const response = await apiClient.post(`/offers/${id}/convert-to-invoice`);
    return response.data;
  },

  // Offer Items
  getItems: async (offerId: number): Promise<OfferItem[]> => {
    const response = await apiClient.get(`/offers/${offerId}/items`);
    return response.data;
  },

  createItem: async (data: CreateOfferItemData): Promise<OfferItem> => {
    const response = await apiClient.post('/offers/items', data);
    return response.data;
  },

  updateItem: async (id: number, data: Partial<CreateOfferItemData>): Promise<OfferItem> => {
    const response = await apiClient.put(`/offers/items/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/offers/items/${id}`);
  },

  // Positionen neu sortieren
  reorderItems: async (offerId: number, itemIds: number[]): Promise<void> => {
    await apiClient.put(`/offers/${offerId}/items/reorder`, { itemIds });
  },

  // Artikel aus Artikelstamm hinzufügen
  addItemFromInventory: async (offerId: number, itemId: number, quantity: number = 1): Promise<OfferItem> => {
    const response = await apiClient.post(`/offers/${offerId}/items/from-inventory`, {
      item_id: itemId,
      quantity,
    });
    return response.data;
  },

  // Offer Texts
  getTexts: async (offerId: number): Promise<OfferText[]> => {
    const response = await apiClient.get(`/offers/${offerId}/texts`);
    return response.data;
  },

  createText: async (data: CreateOfferTextData): Promise<OfferText> => {
    const response = await apiClient.post('/offers/texts', data);
    return response.data;
  },

  updateText: async (id: number, data: Partial<CreateOfferTextData>): Promise<OfferText> => {
    const response = await apiClient.put(`/offers/texts/${id}`, data);
    return response.data;
  },

  deleteText: async (id: number): Promise<void> => {
    await apiClient.delete(`/offers/texts/${id}`);
  },

  // Offer Titles
  getTitles: async (offerId: number): Promise<OfferTitle[]> => {
    const response = await apiClient.get(`/offers/${offerId}/titles`);
    return response.data;
  },

  createTitle: async (data: CreateOfferTitleData): Promise<OfferTitle> => {
    const response = await apiClient.post('/offers/titles', data);
    return response.data;
  },

  updateTitle: async (id: number, data: Partial<CreateOfferTitleData>): Promise<OfferTitle> => {
    const response = await apiClient.put(`/offers/titles/${id}`, data);
    return response.data;
  },

  deleteTitle: async (id: number): Promise<void> => {
    await apiClient.delete(`/offers/titles/${id}`);
  },

  // Vorlagen
  getTemplates: async (): Promise<OfferTemplate[]> => {
    const response = await apiClient.get('/offers/templates');
    return response.data;
  },

  createFromTemplate: async (templateId: number, data: Partial<CreateOfferData>): Promise<Offer> => {
    const response = await apiClient.post(`/offers/templates/${templateId}/create`, data);
    return response.data;
  },
};

export interface OfferText {
  id: number;
  offer_id: number;
  title: string;
  description?: string;
  position_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferTextData {
  offer_id: number;
  title: string;
  description?: string;
  position_order?: number;
}

export interface OfferTitle {
  id: number;
  offer_id: number;
  title: string;
  position_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferTitleData {
  offer_id: number;
  title: string;
  position_order?: number;
}

export interface OfferTemplate {
  id: number;
  name: string;
  description?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  items?: OfferItem[];
  created_at: string;
  updated_at: string;
}
