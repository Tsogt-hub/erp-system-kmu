import { apiClient } from './client';

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
  availability?: string;
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
  availability?: string;
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

