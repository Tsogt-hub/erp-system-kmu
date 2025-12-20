import { apiClient } from './client';

export interface PDFSettings {
  id: number;
  company_id?: number;
  document_type: string;
  
  // Briefpapier
  letterhead_url?: string;
  letterhead_first_page_only: boolean;
  
  // Farben
  primary_color: string;
  secondary_color: string;
  
  // Logo
  logo_url?: string;
  logo_position_x: number;
  logo_position_y: number;
  logo_width: number;
  
  // Schrift
  font_family: string;
  font_size: number;
  
  // Seitenränder
  margin_top: number;
  margin_right: number;
  margin_bottom: number;
  margin_left: number;
  
  // Adressblock
  address_position_x: number;
  address_position_y: number;
  show_sender_line: boolean;
  
  // Header/Footer
  show_fold_marks: boolean;
  footer_font_size: number;
  
  // Textvorlagen
  intro_text_template?: string;
  footer_text_template?: string;
  
  created_at: string;
  updated_at: string;
}

export type UpdatePDFSettingsData = Partial<Omit<PDFSettings, 'id' | 'created_at' | 'updated_at'>>;

export const pdfSettingsApi = {
  // Alle Einstellungen laden
  getAll: async (): Promise<PDFSettings[]> => {
    const response = await apiClient.get('/pdf-settings');
    return response.data;
  },

  // Einstellungen für Dokumententyp laden
  getByDocumentType: async (documentType: string): Promise<PDFSettings> => {
    const response = await apiClient.get(`/pdf-settings/${documentType}`);
    return response.data;
  },

  // Einstellungen aktualisieren
  update: async (documentType: string, data: UpdatePDFSettingsData): Promise<PDFSettings> => {
    const response = await apiClient.put(`/pdf-settings/${documentType}`, data);
    return response.data;
  },

  // Logo hochladen
  uploadLogo: async (file: File, documentType: string = 'default'): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await apiClient.post('/pdf-settings/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Briefpapier hochladen
  uploadLetterhead: async (file: File, documentType: string = 'default'): Promise<{ letterheadUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await apiClient.post('/pdf-settings/upload/letterhead', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Logo löschen
  deleteLogo: async (documentType: string): Promise<void> => {
    await apiClient.delete(`/pdf-settings/${documentType}/logo`);
  },

  // Briefpapier löschen
  deleteLetterhead: async (documentType: string): Promise<void> => {
    await apiClient.delete(`/pdf-settings/${documentType}/letterhead`);
  },

  // Vorschau-URL generieren
  getPreviewUrl: (documentType: string): string => {
    const baseUrl = apiClient.defaults.baseURL || '';
    return `${baseUrl}/pdf-settings/preview/${documentType}`;
  },

  // Einstellungen von einem Typ kopieren
  copySettings: async (fromType: string, toType: string): Promise<PDFSettings> => {
    const response = await apiClient.post(`/pdf-settings/${toType}/copy`, { fromType });
    return response.data;
  },
};

export default pdfSettingsApi;


