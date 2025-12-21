import { apiClient } from './client';

// PV-spezifische Dropdown-Optionen wie in Hero
export const BUILDING_AGE_CLASSES = [
  'Neubau (ab 2020)',
  '2010-2019',
  '2000-2009',
  '1990-1999',
  '1980-1989',
  '1970-1979',
  '1960-1969',
  'Vor 1960',
  'Altbau (vor 1945)',
];

export const BUILDING_TYPES = [
  'Einfamilienhaus',
  'Doppelhaushälfte',
  'Reihenhaus',
  'Mehrfamilienhaus',
  'Gewerbegebäude',
  'Landwirtschaftliches Gebäude',
  'Industriegebäude',
  'Sonstige',
];

export const OWNERSHIP_TYPES = [
  'Eigentum',
  'Miete',
  'Pacht',
  'WEG (Wohnungseigentümergemeinschaft)',
];

export const ROOF_TYPES = [
  'Satteldach',
  'Flachdach',
  'Pultdach',
  'Walmdach',
  'Krüppelwalmdach',
  'Mansarddach',
  'Schleppdach',
  'Zeltdach',
  'Carport',
  'Garage',
  'Sonstige',
];

export const ROOF_MATERIALS = [
  'Ziegel (Ton)',
  'Betondachstein',
  'Schiefer',
  'Bitumen',
  'Trapezblech',
  'Wellblech',
  'Faserzement',
  'Reet/Stroh',
  'Kunststoff',
  'Folie',
  'Kies',
  'Sonstige',
];

export const ROOF_ORIENTATIONS = [
  'Süd',
  'Süd-West',
  'Süd-Ost',
  'West',
  'Ost',
  'Nord-West',
  'Nord-Ost',
  'Nord',
  'Flach (keine Ausrichtung)',
];

export const ROOF_ANGLES = [
  '0° (Flachdach)',
  '5-10°',
  '15-20°',
  '25-30°',
  '35-40°',
  '45-50°',
  'Über 50°',
];

export const WALLBOX_INTEREST = [
  'Ja, sofort',
  'Ja, später',
  'Nein',
  'Bereits vorhanden',
];

export const STORAGE_INTEREST = [
  'Ja, sofort',
  'Ja, später',
  'Nein',
  'Bereits vorhanden',
];

export const INSTALLATION_LOCATIONS = [
  'Nur Dach',
  'Dach + Fassade',
  'Nur Fassade',
  'Freifläche',
  'Carport/Garage',
  'Kombination',
];

export interface PVProjectData {
  id: number;
  project_id: number;
  planned_start?: string;
  start_notes?: string;
  building_age_class?: string;
  building_type?: string;
  residents_count?: number;
  ownership?: string;
  completed_renovations?: string;
  planned_renovations?: string;
  annual_consumption_kwh?: number;
  annual_costs_eur?: number;
  electricity_provider?: string;
  current_tariff?: string;
  roof_type?: string;
  roof_age?: number;
  roof_area_m2?: number;
  roof_material?: string;
  roof_orientation?: string;
  roof_angle?: string;
  roof_condition?: string;
  roof_notes?: string;
  interest_wallbox?: string;
  existing_pv?: boolean;
  existing_pv_kwp?: number;
  desired_kwp?: number;
  available_area_m2?: number;
  installation_location?: string;
  interest_storage?: string;
  desired_storage_kwh?: number;
  meter_type?: string;
  meter_location?: string;
  grid_connection_power?: number;
  three_phase_available?: boolean;
  shading_issues?: string;
  special_requirements?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePVProjectDataInput {
  planned_start?: string;
  start_notes?: string;
  building_age_class?: string;
  building_type?: string;
  residents_count?: number;
  ownership?: string;
  completed_renovations?: string;
  planned_renovations?: string;
  annual_consumption_kwh?: number;
  annual_costs_eur?: number;
  electricity_provider?: string;
  current_tariff?: string;
  roof_type?: string;
  roof_age?: number;
  roof_area_m2?: number;
  roof_material?: string;
  roof_orientation?: string;
  roof_angle?: string;
  roof_condition?: string;
  roof_notes?: string;
  interest_wallbox?: string;
  existing_pv?: boolean;
  existing_pv_kwp?: number;
  desired_kwp?: number;
  available_area_m2?: number;
  installation_location?: string;
  interest_storage?: string;
  desired_storage_kwh?: number;
  meter_type?: string;
  meter_location?: string;
  grid_connection_power?: number;
  three_phase_available?: boolean;
  shading_issues?: string;
  special_requirements?: string;
  notes?: string;
}

export const pvProjectDataApi = {
  getByProjectId: async (projectId: number): Promise<PVProjectData | null> => {
    const response = await apiClient.get(`/pv-project-data/project/${projectId}`);
    return response.data || null;
  },

  upsert: async (projectId: number, data: CreatePVProjectDataInput): Promise<PVProjectData> => {
    const response = await apiClient.put(`/pv-project-data/project/${projectId}`, data);
    return response.data;
  },

  delete: async (projectId: number): Promise<void> => {
    await apiClient.delete(`/pv-project-data/project/${projectId}`);
  },

  getOptions: async () => {
    const response = await apiClient.get('/pv-project-data/options');
    return response.data;
  },
};









