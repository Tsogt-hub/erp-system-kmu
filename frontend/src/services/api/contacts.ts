import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_id?: number;
  position?: string;
  created_at: Date;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getContacts = async (): Promise<Contact[]> => {
  const response = await axios.get(`${API_URL}/crm/contacts`, getAuthHeader());
  return response.data;
};

export const getContactById = async (id: number): Promise<Contact> => {
  const response = await axios.get(`${API_URL}/crm/contacts/${id}`, getAuthHeader());
  return response.data;
};

