import { apiClient } from './client';

// Lead-Quellen wie in Hero
export const LEAD_SOURCES = [
  'E-Mail',
  'Persönlicher Kontakt',
  'Messe',
  'Social Media',
  'Online-Portal',
  'Telefon',
  'Eigene Webseite',
  'Empfehlung',
  'Bestandskunde',
  'Außenwerbung',
  'Netzwerk',
  'Interessent',
  'Flyer / Prospekt',
  'Fahrzeugwerbung',
  'Sonstige',
];

// Erreichbarkeit wie in Hero
export const REACHABILITY_OPTIONS = [
  'Vormittags',
  'Nachmittags',
  'Abends',
  'Ganztags',
  'Nur am Wochenende',
  'ausschließlich per E-Mail',
  'Sonstige',
];

// Anrede-Optionen wie in Hero
export const SALUTATION_OPTIONS = [
  'Herr',
  'Frau',
  'Familie',
  'Eheleute',
  'Dr.',
  'Prof.',
  'Prof. Dr.',
];

export interface Company {
  id: number;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  website?: string;
  notes?: string;
  category?: string;
  customer_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  company_id?: number;
  company_name?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  notes?: string;
  category?: string;
  type?: string;
  is_archived?: boolean;
  customer_number?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  availability?: string;
  // Neue Hero-Felder
  salutation?: string;
  lead_source?: string;
  website?: string;
  fax?: string;
  birthday?: string;
  is_invoice_recipient?: boolean;
  additional_salutation?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  website?: string;
  notes?: string;
  category?: string;
  customer_number?: string;
}

export interface CreateContactData {
  company_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  notes?: string;
  category?: string;
  type?: string;
  is_archived?: boolean;
  customer_number?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  availability?: string;
  // Neue Hero-Felder
  salutation?: string;
  lead_source?: string;
  website?: string;
  fax?: string;
  birthday?: string;
  is_invoice_recipient?: boolean;
  additional_salutation?: string;
}

export const crmApi = {
  // Companies
  getCompanies: async (search?: string): Promise<Company[]> => {
    const params = search ? { search } : {};
    const response = await apiClient.get('/crm/companies', { params });
    return response.data;
  },

  getCompanyById: async (id: number): Promise<Company> => {
    const response = await apiClient.get(`/crm/companies/${id}`);
    return response.data;
  },

  createCompany: async (data: CreateCompanyData): Promise<Company> => {
    const response = await apiClient.post('/crm/companies', data);
    return response.data;
  },

  updateCompany: async (id: number, data: Partial<CreateCompanyData>): Promise<Company> => {
    const response = await apiClient.put(`/crm/companies/${id}`, data);
    return response.data;
  },

  deleteCompany: async (id: number): Promise<void> => {
    await apiClient.delete(`/crm/companies/${id}`);
  },

  // Contacts
  getContacts: async (search?: string, companyId?: number): Promise<Contact[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (companyId) params.companyId = companyId;
    const response = await apiClient.get('/crm/contacts', { params });
    return response.data;
  },

  getContactById: async (id: number): Promise<Contact> => {
    const response = await apiClient.get(`/crm/contacts/${id}`);
    return response.data;
  },

  createContact: async (data: CreateContactData): Promise<Contact> => {
    const response = await apiClient.post('/crm/contacts', data);
    return response.data;
  },

  updateContact: async (id: number, data: Partial<CreateContactData>): Promise<Contact> => {
    const response = await apiClient.put(`/crm/contacts/${id}`, data);
    return response.data;
  },

  deleteContact: async (id: number): Promise<void> => {
    await apiClient.delete(`/crm/contacts/${id}`);
  },
};

