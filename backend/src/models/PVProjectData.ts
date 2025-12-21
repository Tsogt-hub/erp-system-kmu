import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

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
  
  // Zeitplan
  planned_start?: string;
  start_notes?: string;
  
  // Gebäude
  building_age_class?: string;
  building_type?: string;
  residents_count?: number;
  ownership?: string;
  
  // Energetischer Zustand
  completed_renovations?: string;
  planned_renovations?: string;
  annual_consumption_kwh?: number;
  annual_costs_eur?: number;
  electricity_provider?: string;
  current_tariff?: string;
  
  // Dach
  roof_type?: string;
  roof_age?: number;
  roof_area_m2?: number;
  roof_material?: string;
  roof_orientation?: string;
  roof_angle?: string;
  roof_condition?: string;
  roof_notes?: string;
  
  // Gewünschte PV
  interest_wallbox?: string;
  existing_pv?: boolean;
  existing_pv_kwp?: number;
  desired_kwp?: number;
  available_area_m2?: number;
  installation_location?: string;
  interest_storage?: string;
  desired_storage_kwh?: number;
  
  // Elektrische Installation
  meter_type?: string;
  meter_location?: string;
  grid_connection_power?: number;
  three_phase_available?: boolean;
  
  // Sonstiges
  shading_issues?: string;
  special_requirements?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CreatePVProjectDataInput {
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
}

export async function initPVProjectDataTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS pv_project_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL UNIQUE,
        planned_start TEXT,
        start_notes TEXT,
        building_age_class TEXT,
        building_type TEXT,
        residents_count INTEGER,
        ownership TEXT,
        completed_renovations TEXT,
        planned_renovations TEXT,
        annual_consumption_kwh REAL,
        annual_costs_eur REAL,
        electricity_provider TEXT,
        current_tariff TEXT,
        roof_type TEXT,
        roof_age INTEGER,
        roof_area_m2 REAL,
        roof_material TEXT,
        roof_orientation TEXT,
        roof_angle TEXT,
        roof_condition TEXT,
        roof_notes TEXT,
        interest_wallbox TEXT,
        existing_pv INTEGER DEFAULT 0,
        existing_pv_kwp REAL,
        desired_kwp REAL,
        available_area_m2 REAL,
        installation_location TEXT,
        interest_storage TEXT,
        desired_storage_kwh REAL,
        meter_type TEXT,
        meter_location TEXT,
        grid_connection_power REAL,
        three_phase_available INTEGER DEFAULT 1,
        shading_issues TEXT,
        special_requirements TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `, []);
    console.log('✅ PV Project Data table initialized');
  } catch (error: any) {
    console.log('ℹ️ PV Project Data table already exists or error:', error.message);
  }
}

export class PVProjectDataModel {
  static async findByProjectId(projectId: number): Promise<PVProjectData | null> {
    const result = await query(
      `SELECT * FROM pv_project_data WHERE project_id = $1`,
      [projectId]
    );
    return getRow(result);
  }

  static async create(data: CreatePVProjectDataInput): Promise<PVProjectData> {
    const columns = Object.keys(data).filter(k => data[k as keyof CreatePVProjectDataInput] !== undefined);
    const values = columns.map(k => {
      const val = data[k as keyof CreatePVProjectDataInput];
      if (typeof val === 'boolean') return val ? 1 : 0;
      return val;
    });
    const placeholders = columns.map((_, i) => `$${i + 1}`);

    const result = await query(
      `INSERT INTO pv_project_data (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async update(projectId: number, data: Partial<CreatePVProjectDataInput>): Promise<PVProjectData> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'project_id') {
        if (typeof value === 'boolean') {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value ? 1 : 0);
        } else {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(projectId);

    const result = await query(
      `UPDATE pv_project_data SET ${fields.join(', ')} WHERE project_id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async upsert(data: CreatePVProjectDataInput): Promise<PVProjectData> {
    const existing = await this.findByProjectId(data.project_id);
    if (existing) {
      return this.update(data.project_id, data);
    }
    return this.create(data);
  }

  static async delete(projectId: number): Promise<void> {
    await query('DELETE FROM pv_project_data WHERE project_id = $1', [projectId]);
  }
}









