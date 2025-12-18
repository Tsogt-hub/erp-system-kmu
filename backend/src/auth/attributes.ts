import { UserAttributes } from './types';
import { UserModel } from '../models/User';
import { query } from '../config/database';

export async function resolveUserAttributes(userId: number): Promise<UserAttributes> {
  const base: UserAttributes = {};

  const user = await UserModel.findById(userId);
  if (user?.role_id === 1) {
    base.business_unit = 'executive';
  }

  try {
    const result = await query(
      `SELECT DISTINCT project_id FROM project_members WHERE user_id = $1`,
      [userId]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    base.project_ids = rows.map((row: any) => row.project_id);
  } catch (error) {
    base.project_ids = [];
  }

  return base;
}


