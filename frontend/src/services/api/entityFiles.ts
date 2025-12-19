import { apiClient } from './client';

// Datei-Typen
export const FILE_TYPES = [
  { value: 'image', label: 'Bild', icon: '🖼️' },
  { value: 'document', label: 'Dokument', icon: '📄' },
  { value: 'pdf', label: 'PDF', icon: '📕' },
  { value: 'spreadsheet', label: 'Tabelle', icon: '📊' },
  { value: 'presentation', label: 'Präsentation', icon: '📽️' },
  { value: 'archive', label: 'Archiv', icon: '📦' },
  { value: 'other', label: 'Sonstige', icon: '📎' },
];

// Datei-Kategorien
export const FILE_CATEGORIES = [
  'Allgemein',
  'Angebot',
  'Vertrag',
  'Rechnung',
  'Foto',
  'Technische Zeichnung',
  'Datenblatt',
  'Zertifikat',
  'Protokoll',
  'Korrespondenz',
  'Sonstige',
];

export interface EntityFile {
  id: number;
  entity_type: 'project' | 'contact' | 'company' | 'offer' | 'document';
  entity_id: number;
  file_name: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  category?: string;
  description?: string;
  is_public: boolean;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  uploaded_by_name?: string;
}

export interface CreateEntityFileData {
  entity_type: 'project' | 'contact' | 'company' | 'offer' | 'document';
  entity_id: number;
  file_name: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  category?: string;
  description?: string;
  is_public?: boolean;
}

export interface FileCounts {
  images: number;
  documents: number;
  total: number;
}

export const entityFilesApi = {
  getByEntity: async (entityType: string, entityId: number, category?: string): Promise<EntityFile[]> => {
    const response = await apiClient.get(`/entity-files/entity/${entityType}/${entityId}`, {
      params: category ? { category } : {},
    });
    return response.data;
  },

  getImages: async (entityType: string, entityId: number): Promise<EntityFile[]> => {
    const response = await apiClient.get(`/entity-files/entity/${entityType}/${entityId}/images`);
    return response.data;
  },

  getDocuments: async (entityType: string, entityId: number): Promise<EntityFile[]> => {
    const response = await apiClient.get(`/entity-files/entity/${entityType}/${entityId}/documents`);
    return response.data;
  },

  getCounts: async (entityType: string, entityId: number): Promise<FileCounts> => {
    const response = await apiClient.get(`/entity-files/entity/${entityType}/${entityId}/counts`);
    return response.data;
  },

  getById: async (id: number): Promise<EntityFile> => {
    const response = await apiClient.get(`/entity-files/${id}`);
    return response.data;
  },

  create: async (data: CreateEntityFileData): Promise<EntityFile> => {
    const response = await apiClient.post('/entity-files', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateEntityFileData>): Promise<EntityFile> => {
    const response = await apiClient.put(`/entity-files/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/entity-files/${id}`);
  },

  getOptions: async () => {
    const response = await apiClient.get('/entity-files/options');
    return response.data;
  },
};

// Helper functions
export function getFileTypeLabel(type: string): string {
  const t = FILE_TYPES.find(ft => ft.value === type);
  return t?.label || type;
}

export function getFileTypeIcon(type: string): string {
  const t = FILE_TYPES.find(ft => ft.value === type);
  return t?.icon || '📎';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileTypeFromMime(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
  return 'other';
}







