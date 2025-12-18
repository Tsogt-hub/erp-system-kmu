import { apiClient } from './client';

// Zahlungsstatus
export const PAYMENT_STATUSES = [
  { value: 'open', label: 'Offen', color: '#2196F3' },
  { value: 'partial', label: 'Teilbezahlt', color: '#FF9800' },
  { value: 'paid', label: 'Bezahlt', color: '#4CAF50' },
  { value: 'overdue', label: 'Überfällig', color: '#F44336' },
  { value: 'reminded', label: 'Gemahnt', color: '#9C27B0' },
  { value: 'cancelled', label: 'Storniert', color: '#795548' },
];

// Zahlungsmethoden
export const PAYMENT_METHODS = [
  'Überweisung',
  'Bar',
  'EC-Karte',
  'Kreditkarte',
  'PayPal',
  'Lastschrift',
  'Scheck',
  'Sonstige',
];

export interface OpenItem {
  id: number;
  document_id: number;
  document_type: string;
  document_number: string;
  customer_id: number;
  customer_name?: string;
  project_id?: number;
  project_name?: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  open_amount: number;
  status: string;
  dunning_level: number;
  last_dunning_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  open_item_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
  created_by: number;
  created_at: string;
  created_by_name?: string;
}

export interface CreateOpenItemData {
  document_id: number;
  document_type: string;
  document_number: string;
  customer_id: number;
  project_id?: number;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  notes?: string;
}

export interface CreatePaymentData {
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
}

export interface OpenItemStatistics {
  totalOpen: number;
  totalOverdue: number;
  openAmount: number;
  overdueAmount: number;
  paidThisMonth: number;
}

export const openItemsApi = {
  getAll: async (status?: string): Promise<OpenItem[]> => {
    const response = await apiClient.get('/open-items', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  getOpen: async (): Promise<OpenItem[]> => {
    const response = await apiClient.get('/open-items/open');
    return response.data;
  },

  getOverdue: async (): Promise<OpenItem[]> => {
    const response = await apiClient.get('/open-items/overdue');
    return response.data;
  },

  getByCustomer: async (customerId: number): Promise<OpenItem[]> => {
    const response = await apiClient.get(`/open-items/customer/${customerId}`);
    return response.data;
  },

  getById: async (id: number): Promise<OpenItem> => {
    const response = await apiClient.get(`/open-items/${id}`);
    return response.data;
  },

  create: async (data: CreateOpenItemData): Promise<OpenItem> => {
    const response = await apiClient.post('/open-items', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateOpenItemData>): Promise<OpenItem> => {
    const response = await apiClient.put(`/open-items/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/open-items/${id}`);
  },

  // Payments
  getPayments: async (openItemId: number): Promise<Payment[]> => {
    const response = await apiClient.get(`/open-items/${openItemId}/payments`);
    return response.data;
  },

  addPayment: async (openItemId: number, data: CreatePaymentData): Promise<Payment> => {
    const response = await apiClient.post(`/open-items/${openItemId}/payments`, data);
    return response.data;
  },

  deletePayment: async (paymentId: number): Promise<void> => {
    await apiClient.delete(`/open-items/payments/${paymentId}`);
  },

  // Dunning
  incrementDunning: async (id: number): Promise<OpenItem> => {
    const response = await apiClient.post(`/open-items/${id}/dunning`);
    return response.data;
  },

  // Statistics
  getStatistics: async (): Promise<OpenItemStatistics> => {
    const response = await apiClient.get('/open-items/statistics');
    return response.data;
  },

  getStatuses: async (): Promise<string[]> => {
    const response = await apiClient.get('/open-items/statuses');
    return response.data;
  },
};

// Helper functions
export function getPaymentStatusLabel(status: string): string {
  const s = PAYMENT_STATUSES.find(ps => ps.value === status);
  return s?.label || status;
}

export function getPaymentStatusColor(status: string): string {
  const s = PAYMENT_STATUSES.find(ps => ps.value === status);
  return s?.color || '#9E9E9E';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}





