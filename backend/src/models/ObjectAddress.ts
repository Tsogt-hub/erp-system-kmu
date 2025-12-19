import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

// Adresstypen
export const ADDRESS_TYPES = [
  'billing',      // Rechnungsadresse
  'delivery',     // Lieferadresse
  'installation', // Installationsadresse
  'project',      // Projektadresse
  'other',        // Sonstige
];

export interface ObjectAddress {
  id: number;
  entity_type: 'contact' | 'company' | 'project';
  entity_id: number;
  address_type: string;
  label?: string;
  street: string;
  house_number?: string;
  address_line_2?: string;
  postal_code: string;
  city: string;
  state?: string;
  country: string;
  is_default: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectAddressData {
  entity_type: 'contact' | 'company' | 'project';
  entity_id: number;
  address_type: string;
  label?: string;
  street: string;
  house_number?: string;
  address_line_2?: string;
  postal_code: string;
  city: string;
  state?: string;
  country?: string;
  is_default?: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export async function initObjectAddressesTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS object_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        address_type TEXT NOT NULL DEFAULT 'other',
        label TEXT,
        street TEXT NOT NULL,
        house_number TEXT,
        address_line_2 TEXT,
        postal_code TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT,
        country TEXT DEFAULT 'Deutschland',
        is_default INTEGER DEFAULT 0,
        notes TEXT,
        latitude REAL,
        longitude REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `, []);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_object_addresses_entity 
      ON object_addresses(entity_type, entity_id)
    `, []);

    console.log('✅ Object addresses table initialized');
  } catch (error: any) {
    console.log('ℹ️ Object addresses table already exists or error:', error.message);
  }
}

export class ObjectAddressModel {
  static async findById(id: number): Promise<ObjectAddress | null> {
    const result = await query(
      `SELECT * FROM object_addresses WHERE id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findByEntity(entityType: string, entityId: number): Promise<ObjectAddress[]> {
    const result = await query(
      `SELECT * FROM object_addresses 
       WHERE entity_type = $1 AND entity_id = $2
       ORDER BY is_default DESC, address_type ASC`,
      [entityType, entityId]
    );
    return getRows(result);
  }

  static async findDefault(entityType: string, entityId: number, addressType?: string): Promise<ObjectAddress | null> {
    let queryText = `
      SELECT * FROM object_addresses 
      WHERE entity_type = $1 AND entity_id = $2 AND is_default = 1
    `;
    const params: any[] = [entityType, entityId];

    if (addressType) {
      queryText += ` AND address_type = $3`;
      params.push(addressType);
    }

    queryText += ` LIMIT 1`;

    const result = await query(queryText, params);
    return getRow(result);
  }

  static async create(data: CreateObjectAddressData): Promise<ObjectAddress> {
    // If this is marked as default, unset other defaults
    if (data.is_default) {
      await query(
        `UPDATE object_addresses SET is_default = 0 
         WHERE entity_type = $1 AND entity_id = $2 AND address_type = $3`,
        [data.entity_type, data.entity_id, data.address_type]
      );
    }

    const result = await query(
      `INSERT INTO object_addresses (entity_type, entity_id, address_type, label, street, house_number, address_line_2, postal_code, city, state, country, is_default, notes, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        data.entity_type,
        data.entity_id,
        data.address_type,
        data.label || null,
        data.street,
        data.house_number || null,
        data.address_line_2 || null,
        data.postal_code,
        data.city,
        data.state || null,
        data.country || 'Deutschland',
        data.is_default ? 1 : 0,
        data.notes || null,
        data.latitude || null,
        data.longitude || null,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateObjectAddressData>): Promise<ObjectAddress> {
    // Get current address for entity info
    const current = await this.findById(id);
    
    // If this is being marked as default, unset other defaults
    if (data.is_default && current) {
      await query(
        `UPDATE object_addresses SET is_default = 0 
         WHERE entity_type = $1 AND entity_id = $2 AND address_type = $3 AND id != $4`,
        [current.entity_type, current.entity_id, data.address_type || current.address_type, id]
      );
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && !['entity_type', 'entity_id'].includes(key)) {
        if (key === 'is_default' && typeof value === 'boolean') {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value ? 1 : 0);
        } else {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE object_addresses SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM object_addresses WHERE id = $1', [id]);
  }

  static async deleteByEntity(entityType: string, entityId: number): Promise<void> {
    await query('DELETE FROM object_addresses WHERE entity_type = $1 AND entity_id = $2', [entityType, entityId]);
  }

  // Format address as string
  static formatAddress(address: ObjectAddress): string {
    const parts = [
      address.street + (address.house_number ? ' ' + address.house_number : ''),
      address.address_line_2,
      `${address.postal_code} ${address.city}`,
      address.state,
      address.country !== 'Deutschland' ? address.country : null,
    ].filter(Boolean);
    return parts.join(', ');
  }

  // Format address as multiline
  static formatAddressMultiline(address: ObjectAddress): string {
    const lines = [
      address.street + (address.house_number ? ' ' + address.house_number : ''),
      address.address_line_2,
      `${address.postal_code} ${address.city}`,
      address.state,
      address.country !== 'Deutschland' ? address.country : null,
    ].filter(Boolean);
    return lines.join('\n');
  }
}






