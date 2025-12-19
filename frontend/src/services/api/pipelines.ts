import axios from 'axios';
import { Project } from './projects';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

export interface PipelineStats {
  pipeline: PipelineConfig;
  stats: {
    step: string;
    count: number;
    overdue?: number;
  }[];
  total: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const pipelinesApi = {
  getStats: async (type: string): Promise<PipelineStats> => {
    const response = await axios.get(`${API_URL}/pipelines/${type}/stats`, { headers: getAuthHeaders() });
    return response.data;
  },

  getProjectsByStep: async (type: string, step: string): Promise<Project[]> => {
    const response = await axios.get(`${API_URL}/pipelines/${type}/${step}/projects`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  moveProject: async (projectId: number, stepId: string): Promise<Project> => {
    const response = await axios.put(
      `${API_URL}/pipelines/${projectId}/move`,
      { newStepId: stepId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  getPipelines: async (): Promise<PipelineConfig[]> => {
    const response = await axios.get(`${API_URL}/pipelines`, { headers: getAuthHeaders() });
    return response.data;
  },
};

