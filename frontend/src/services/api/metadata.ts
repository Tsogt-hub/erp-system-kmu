import { apiClient } from './client';

export interface DataAsset {
  id: number;
  name: string;
  domain: string;
  owner: string;
  description?: string;
  source?: string;
  tags: string[];
  sensitivity: string;
  retention_policy?: string;
  created_at: string;
  updated_at: string;
}

export interface DataQualityRule {
  id: number;
  asset_id: number;
  name: string;
  dimension: string;
  threshold: number;
  severity: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const metadataApi = {
  async listAssets(): Promise<DataAsset[]> {
    const response = await apiClient.get('/metadata/assets');
    return response.data.data;
  },
  async createAsset(payload: Partial<DataAsset>) {
    const response = await apiClient.post('/metadata/assets', payload);
    return response.data.data as DataAsset;
  },
  async listQualityRules(assetId?: number): Promise<DataQualityRule[]> {
    const response = await apiClient.get('/metadata/quality-rules', {
      params: assetId ? { assetId } : undefined,
    });
    return response.data.data;
  },
};


