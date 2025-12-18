import { query } from '../config/database';

export interface Role {
  id: number;
  name: string;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}

export class RoleModel {
  static async findById(id: number): Promise<Role | null> {
    const result = await query('SELECT * FROM roles WHERE id = $1', [id]);
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0] ? RoleModel.mapRow(rows[0]) : null;
  }

  static async findByName(name: string): Promise<Role | null> {
    const result = await query('SELECT * FROM roles WHERE name = $1', [name]);
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0] ? RoleModel.mapRow(rows[0]) : null;
  }

  static async upsertDefaultRoles(defaultRoles: Array<{ name: string; permissions: string[] }>) {
    for (const role of defaultRoles) {
      await query(
        `INSERT INTO roles (name, permissions)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions, updated_at = CURRENT_TIMESTAMP`,
        [role.name, JSON.stringify(role.permissions)]
      );
    }
  }

  private static mapRow(row: any): Role {
    return {
      id: row.id,
      name: row.name,
      permissions: normalizePermissions(row.permissions),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}

function normalizePermissions(raw: any): string[] {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return normalizePermissions(parsed);
    } catch {
      return [raw];
    }
  }

  if (typeof raw === 'object') {
    return Object.entries(raw)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key);
  }

  return [];
}



