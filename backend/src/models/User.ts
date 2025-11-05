import { query } from '../config/database';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role_id?: number;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0] || null;
  }

  static async create(data: CreateUserData): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.email, data.password_hash, data.first_name, data.last_name, data.role_id || 3]
    );
    // SQLite gibt direkt rows zurück, PostgreSQL gibt ein Result-Objekt zurück
    const user = Array.isArray(result) ? result[0] : result.rows[0];
    return user;
  }

  static async update(id: number, data: Partial<CreateUserData>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.first_name) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(data.first_name);
    }
    if (data.last_name) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(data.last_name);
    }
    if (data.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.role_id) {
      fields.push(`role_id = $${paramCount++}`);
      values.push(data.role_id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0];
  }

  static async findAll(): Promise<User[]> {
    const result = await query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       ORDER BY u.created_at DESC`
    );
    return Array.isArray(result) ? result : result.rows;
  }
}

