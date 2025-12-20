import { apiClient } from './client';

// Dokumenttypen wie in Hero
export const DOCUMENT_TYPES = [
  { value: 'offer', label: 'Angebot', prefix: 'ANG', icon: '📋', color: '#2196F3' },
  { value: 'order_confirmation', label: 'Auftragsbestätigung', prefix: 'AB', icon: '✅', color: '#4CAF50' },
  { value: 'invoice', label: 'Rechnung', prefix: 'RE', icon: '💰', color: '#FF9800' },
  { value: 'partial_invoice', label: 'Teilrechnung', prefix: 'TR', icon: '📊', color: '#FF5722' },
  { value: 'material_list', label: 'Materialliste', prefix: 'ML', icon: '📦', color: '#9C27B0' },
  { value: 'delivery_note', label: 'Lieferschein', prefix: 'LS', icon: '🚚', color: '#00BCD4' },
  { value: 'reminder', label: 'Mahnung', prefix: 'MA', icon: '⚠️', color: '#F44336' },
  { value: 'credit_note', label: 'Gutschrift', prefix: 'GS', icon: '💳', color: '#607D8B' },
];

// Dokumentstatus
export const DOCUMENT_STATUSES = [
  { value: 'draft', label: 'Entwurf', color: '#9E9E9E' },
  { value: 'sent', label: 'Versendet', color: '#2196F3' },
  { value: 'accepted', label: 'Angenommen', color: '#4CAF50' },
  { value: 'rejected', label: 'Abgelehnt', color: '#F44336' },
  { value: 'paid', label: 'Bezahlt', color: '#8BC34A' },
  { value: 'overdue', label: 'Überfällig', color: '#FF5722' },
  { value: 'cancelled', label: 'Storniert', color: '#795548' },
];

export interface Document {
  id: number;
  document_type: string;
  document_number: string;
  reference_id?: number;
  reference_type?: string;
  project_id?: number;
  customer_id?: number;
  contact_id?: number;
  net_amount: number;
  tax_amount: number;
  gross_amount: number;
  tax_rate: number;
  discount_amount?: number;
  discount_percent?: number;
  document_date: string;
  valid_until?: string;
  delivery_date?: string;
  due_date?: string;
  subject?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  notes?: string;
  internal_notes?: string;
  status: string;
  sent_at?: string;
  paid_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  project_name?: string;
  contact_name?: string;
  created_user_name?: string;
}

export interface CreateDocumentData {
  document_type: string;
  document_number?: string;
  reference_id?: number;
  reference_type?: string;
  project_id?: number;
  customer_id?: number;
  contact_id?: number;
  net_amount: number;
  tax_amount?: number;
  gross_amount?: number;
  tax_rate?: number;
  discount_amount?: number;
  discount_percent?: number;
  document_date?: string;
  valid_until?: string;
  delivery_date?: string;
  due_date?: string;
  subject?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  notes?: string;
  internal_notes?: string;
  status?: string;
}

export const documentsApi = {
  // Get documents by type
  getByType: async (type: string): Promise<Document[]> => {
    const response = await apiClient.get(`/documents/type/${type}`);
    return response.data;
  },

  // Get documents by project
  getByProject: async (projectId: number): Promise<Document[]> => {
    const response = await apiClient.get(`/documents/project/${projectId}`);
    return response.data;
  },

  // Get documents by customer
  getByCustomer: async (customerId: number): Promise<Document[]> => {
    const response = await apiClient.get(`/documents/customer/${customerId}`);
    return response.data;
  },

  // Get single document
  getById: async (id: number): Promise<Document> => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  // Create document
  create: async (data: CreateDocumentData): Promise<Document> => {
    const response = await apiClient.post('/documents', data);
    return response.data;
  },

  // Create from offer
  createFromOffer: async (offerId: number, documentType: string): Promise<Document> => {
    const response = await apiClient.post(`/documents/from-offer/${offerId}`, {
      document_type: documentType,
    });
    return response.data;
  },

  // Update document
  update: async (id: number, data: Partial<CreateDocumentData>): Promise<Document> => {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data;
  },

  // Update status
  updateStatus: async (id: number, status: string): Promise<Document> => {
    const response = await apiClient.patch(`/documents/${id}/status`, { status });
    return response.data;
  },

  // Delete document
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },

  // Get types
  getTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/documents/types');
    return response.data;
  },

  // Get statuses
  getStatuses: async (): Promise<string[]> => {
    const response = await apiClient.get('/documents/statuses');
    return response.data;
  },
};

// Helper functions
export function getDocumentTypeLabel(type: string): string {
  const docType = DOCUMENT_TYPES.find(t => t.value === type);
  return docType?.label || type;
}

export function getDocumentTypeIcon(type: string): string {
  const docType = DOCUMENT_TYPES.find(t => t.value === type);
  return docType?.icon || '📄';
}

export function getDocumentTypeColor(type: string): string {
  const docType = DOCUMENT_TYPES.find(t => t.value === type);
  return docType?.color || '#9E9E9E';
}

export function getDocumentStatusLabel(status: string): string {
  const docStatus = DOCUMENT_STATUSES.find(s => s.value === status);
  return docStatus?.label || status;
}

export function getDocumentStatusColor(status: string): string {
  const docStatus = DOCUMENT_STATUSES.find(s => s.value === status);
  return docStatus?.color || '#9E9E9E';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}








