import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Company {
  id: number;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
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

export const getCompanies = async (): Promise<Company[]> => {
  const response = await axios.get(`${API_URL}/crm/companies`, getAuthHeader());
  return response.data;
};

export const getCompanyById = async (id: number): Promise<Company> => {
  const response = await axios.get(`${API_URL}/crm/companies/${id}`, getAuthHeader());
  return response.data;
};

