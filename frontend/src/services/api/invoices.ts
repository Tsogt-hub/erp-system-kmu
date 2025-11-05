import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  contact_id: number;
  company_id?: number;
  offer_id?: number;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  payment_terms?: string;
  notes?: string;
  footer_text?: string;
  contact_name?: string;
  company_name?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  item_type: 'article' | 'service' | 'text' | 'title';
  item_id?: number;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total_price: number;
  position: number;
}

export interface CreateInvoiceData {
  invoice_date: Date;
  due_date: Date;
  contact_id: number;
  company_id?: number;
  offer_id?: number;
  status?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  payment_terms?: string;
  notes?: string;
  footer_text?: string;
}

export interface InvoiceStats {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  partially_paid: number;
  overdue: number;
  cancelled: number;
  total_revenue: number;
  outstanding_amount: number;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getInvoices = async (filters?: {
  status?: string;
  contact_id?: number;
  company_id?: number;
  from_date?: string;
  to_date?: string;
}): Promise<Invoice[]> => {
  const response = await axios.get(`${API_URL}/invoices`, {
    ...getAuthHeader(),
    params: filters,
  });
  return response.data;
};

export const getInvoiceById = async (id: number): Promise<Invoice> => {
  const response = await axios.get(`${API_URL}/invoices/${id}`, getAuthHeader());
  return response.data;
};

export const createInvoice = async (data: CreateInvoiceData): Promise<Invoice> => {
  const response = await axios.post(`${API_URL}/invoices`, data, getAuthHeader());
  return response.data;
};

export const updateInvoice = async (id: number, data: Partial<CreateInvoiceData>): Promise<Invoice> => {
  const response = await axios.put(`${API_URL}/invoices/${id}`, data, getAuthHeader());
  return response.data;
};

export const deleteInvoice = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/invoices/${id}`, getAuthHeader());
};

export const recordPayment = async (id: number, amount: number): Promise<Invoice> => {
  const response = await axios.post(
    `${API_URL}/invoices/${id}/payment`,
    { amount },
    getAuthHeader()
  );
  return response.data;
};

export const getInvoiceStats = async (): Promise<InvoiceStats> => {
  const response = await axios.get(`${API_URL}/invoices/stats`, getAuthHeader());
  return response.data;
};

export const getOverdueInvoices = async (): Promise<Invoice[]> => {
  const response = await axios.get(`${API_URL}/invoices/overdue`, getAuthHeader());
  return response.data;
};
