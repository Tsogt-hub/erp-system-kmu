import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface PaymentData {
  id: number;
  entity_type: 'contact' | 'company';
  entity_id: number;
  account_holder: string;
  bank_name: string;
  iban: string;
  bic?: string;
  // SEPA-Mandat
  sepa_mandate_reference?: string;
  sepa_mandate_date?: string;
  sepa_mandate_type?: 'CORE' | 'B2B';
  is_default: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentDataInput {
  entity_type: 'contact' | 'company';
  entity_id: number;
  account_holder: string;
  bank_name: string;
  iban: string;
  bic?: string;
  sepa_mandate_reference?: string;
  sepa_mandate_date?: string;
  sepa_mandate_type?: 'CORE' | 'B2B';
  is_default?: boolean;
  notes?: string;
}

export async function initPaymentDataTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS payment_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        account_holder TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        iban TEXT NOT NULL,
        bic TEXT,
        sepa_mandate_reference TEXT,
        sepa_mandate_date TEXT,
        sepa_mandate_type TEXT,
        is_default INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `, []);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_data_entity 
      ON payment_data(entity_type, entity_id)
    `, []);

    console.log('✅ Payment data table initialized');
  } catch (error: any) {
    console.log('ℹ️ Payment data table already exists or error:', error.message);
  }
}

export class PaymentDataModel {
  static async findById(id: number): Promise<PaymentData | null> {
    const result = await query(`SELECT * FROM payment_data WHERE id = $1`, [id]);
    return getRow(result);
  }

  static async findByEntity(entityType: string, entityId: number): Promise<PaymentData[]> {
    const result = await query(
      `SELECT * FROM payment_data 
       WHERE entity_type = $1 AND entity_id = $2
       ORDER BY is_default DESC, created_at DESC`,
      [entityType, entityId]
    );
    return getRows(result);
  }

  static async findDefault(entityType: string, entityId: number): Promise<PaymentData | null> {
    const result = await query(
      `SELECT * FROM payment_data 
       WHERE entity_type = $1 AND entity_id = $2 AND is_default = 1
       LIMIT 1`,
      [entityType, entityId]
    );
    return getRow(result);
  }

  static async create(data: CreatePaymentDataInput): Promise<PaymentData> {
    if (data.is_default) {
      await query(
        `UPDATE payment_data SET is_default = 0 
         WHERE entity_type = $1 AND entity_id = $2`,
        [data.entity_type, data.entity_id]
      );
    }

    const result = await query(
      `INSERT INTO payment_data (entity_type, entity_id, account_holder, bank_name, iban, bic, sepa_mandate_reference, sepa_mandate_date, sepa_mandate_type, is_default, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.entity_type,
        data.entity_id,
        data.account_holder,
        data.bank_name,
        data.iban,
        data.bic || null,
        data.sepa_mandate_reference || null,
        data.sepa_mandate_date || null,
        data.sepa_mandate_type || null,
        data.is_default ? 1 : 0,
        data.notes || null,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreatePaymentDataInput>): Promise<PaymentData> {
    const current = await this.findById(id);

    if (data.is_default && current) {
      await query(
        `UPDATE payment_data SET is_default = 0 
         WHERE entity_type = $1 AND entity_id = $2 AND id != $3`,
        [current.entity_type, current.entity_id, id]
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
      `UPDATE payment_data SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM payment_data WHERE id = $1', [id]);
  }

  // IBAN validieren (einfache Prüfung)
  static validateIBAN(iban: string): boolean {
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    // Einfache Längenprüfung für deutsche IBANs
    if (cleanIban.startsWith('DE') && cleanIban.length !== 22) {
      return false;
    }
    // Weitere Länder können hinzugefügt werden
    return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/.test(cleanIban);
  }

  // IBAN formatieren
  static formatIBAN(iban: string): string {
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    return cleanIban.replace(/(.{4})/g, '$1 ').trim();
  }
}





