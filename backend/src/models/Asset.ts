import { pool } from '../config/database';

export interface Asset {
  id: number;
  asset_name: string;
  asset_category: 'vehicle' | 'tool' | 'equipment' | 'computer' | 'furniture' | 'other';
  asset_number: string;
  purchase_date: Date;
  purchase_price: number;
  current_value: number;
  depreciation_method: 'linear' | 'declining' | 'none';
  depreciation_rate: number;
  useful_life_years: number;
  location?: string;
  assigned_to?: number;
  status: 'available' | 'in_use' | 'maintenance' | 'disposed';
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  warranty_expiry?: Date;
  last_maintenance_date?: Date;
  next_maintenance_date?: Date;
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAssetData {
  asset_name: string;
  asset_category: string;
  purchase_date: Date;
  purchase_price: number;
  current_value: number;
  depreciation_method?: string;
  depreciation_rate?: number;
  useful_life_years?: number;
  location?: string;
  assigned_to?: number;
  status?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  warranty_expiry?: Date;
  notes?: string;
  created_by: number;
}

export class AssetModel {
  static async findById(id: number): Promise<Asset | null> {
    const result = await pool.query(
      `SELECT a.*, 
        u.first_name || ' ' || u.last_name as assigned_to_name
       FROM assets a
       LEFT JOIN users u ON a.assigned_to = u.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    category?: string;
    status?: string;
    assigned_to?: number;
  }): Promise<Asset[]> {
    let query = `
      SELECT a.*, 
        u.first_name || ' ' || u.last_name as assigned_to_name
      FROM assets a
      LEFT JOIN users u ON a.assigned_to = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.category) {
      query += ` AND a.asset_category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters?.status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.assigned_to) {
      query += ` AND a.assigned_to = $${paramCount}`;
      params.push(filters.assigned_to);
      paramCount++;
    }

    query += ' ORDER BY a.purchase_date DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async create(data: CreateAssetData): Promise<Asset> {
    const year = new Date(data.purchase_date).getFullYear();
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM assets WHERE EXTRACT(YEAR FROM purchase_date) = $1`,
      [year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const asset_number = `ASS-${year}-${count.toString().padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO assets (
        asset_number, asset_name, asset_category, purchase_date, purchase_price,
        current_value, depreciation_method, depreciation_rate, useful_life_years,
        location, assigned_to, status, manufacturer, model, serial_number,
        warranty_expiry, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        asset_number,
        data.asset_name,
        data.asset_category,
        data.purchase_date,
        data.purchase_price,
        data.current_value,
        data.depreciation_method || 'linear',
        data.depreciation_rate || 0,
        data.useful_life_years || 5,
        data.location || null,
        data.assigned_to || null,
        data.status || 'available',
        data.manufacturer || null,
        data.model || null,
        data.serial_number || null,
        data.warranty_expiry || null,
        data.notes || null,
        data.created_by,
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<CreateAssetData>): Promise<Asset | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE assets SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM assets WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async calculateDepreciation(id: number): Promise<number> {
    const asset = await this.findById(id);
    if (!asset || asset.depreciation_method === 'none') return asset?.current_value || 0;

    const yearsOwned = (new Date().getTime() - new Date(asset.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (asset.depreciation_method === 'linear') {
      const annualDepreciation = asset.purchase_price / asset.useful_life_years;
      const totalDepreciation = annualDepreciation * Math.min(yearsOwned, asset.useful_life_years);
      return Math.max(0, asset.purchase_price - totalDepreciation);
    }

    // Declining balance
    const depreciationFactor = Math.pow(1 - asset.depreciation_rate / 100, yearsOwned);
    return asset.purchase_price * depreciationFactor;
  }
}

