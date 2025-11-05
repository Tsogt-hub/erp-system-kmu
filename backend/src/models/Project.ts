import { query } from '../config/database';

export interface Project {
  id: number;
  name: string;
  reference: string;
  customer_id: number;
  status: string;
  project_type?: string;
  pipeline_step?: string;
  source: string;
  start_date: Date;
  end_date: Date;
  description: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  customer_name?: string;
  member_count?: number;
}

export interface CreateProjectData {
  name: string;
  reference?: string;
  customer_id?: number;
  status?: string;
  project_type?: string;
  pipeline_step?: string;
  source?: string;
  start_date?: Date;
  end_date?: Date;
  description?: string;
  created_by: number;
}

export class ProjectModel {
  static async findById(id: number): Promise<Project | null> {
    const result = await query(
      `SELECT p.*, c.name as customer_name 
       FROM projects p 
       LEFT JOIN companies c ON p.customer_id = c.id 
       WHERE p.id = $1`,
      [id]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0] || null;
  }

  static async findAll(userId?: number, projectType?: string, pipelineStep?: string): Promise<Project[]> {
    // Vereinfachte Query ohne JOINs für SQLite-Kompatibilität
    let queryText = `
      SELECT p.*, c.name as customer_name
      FROM projects p
      LEFT JOIN companies c ON p.customer_id = c.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramCount = 1;

    if (userId) {
      const userIdParam = paramCount++;
      conditions.push(`p.created_by = $${userIdParam}`);
      params.push(userId);
    }

    if (projectType) {
      conditions.push(`p.project_type = $${paramCount++}`);
      params.push(projectType);
    }

    if (pipelineStep) {
      conditions.push(`p.pipeline_step = $${paramCount++}`);
      params.push(pipelineStep);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY p.created_at DESC`;

    const result = await query(queryText, params);
    const rows = Array.isArray(result) ? result : result.rows;
    
    // Füge member_count manuell hinzu (vereinfacht für SQLite)
    const projectsWithMembers = await Promise.all(
      rows.map(async (project: any) => {
        try {
          const memberCountResult = await query(
            'SELECT COUNT(*) as count FROM project_members WHERE project_id = $1',
            [project.id]
          );
          const memberRow = Array.isArray(memberCountResult) 
            ? memberCountResult[0] 
            : (memberCountResult.rows?.[0] || { count: 0 });
          return {
            ...project,
            member_count: parseInt(String(memberRow.count || '0'))
          };
        } catch {
          return { ...project, member_count: 0 };
        }
      })
    );
    
    return projectsWithMembers;
  }

  static async create(data: CreateProjectData): Promise<Project> {
    const reference = data.reference || `PRJ-${Date.now()}`;
    const result = await query(
      `INSERT INTO projects (name, reference, customer_id, status, project_type, pipeline_step, source, start_date, end_date, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.name,
        reference,
        data.customer_id || null,
        data.status || 'draft',
        data.project_type || 'general',
        data.pipeline_step || 'new_contact',
        data.source || null,
        data.start_date || null,
        data.end_date || null,
        data.description || null,
        data.created_by,
      ]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0];
  }

  static async updatePipelineStep(id: number, pipelineStep: string): Promise<Project> {
    const result = await query(
      `UPDATE projects 
       SET pipeline_step = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [pipelineStep, id]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    if (rows.length === 0) {
      throw new Error('Project not found');
    }
    return rows[0];
  }

  static async update(id: number, data: Partial<CreateProjectData>): Promise<Project> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'created_by') {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0];
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM projects WHERE id = $1', [id]);
  }

  // Project Members
  static async addMember(projectId: number, userId: number, role: string = 'member'): Promise<void> {
    // Prüfe zuerst ob Member bereits existiert
    const existing = await query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    const rows = Array.isArray(existing) ? existing : existing.rows;
    if (rows.length > 0) {
      return; // Bereits vorhanden
    }
    
    await query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [projectId, userId, role]
    );
  }

  static async removeMember(projectId: number, userId: number): Promise<void> {
    await query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
  }

  static async getMembers(projectId: number): Promise<Array<{ id: number; user_id: number; role: string; first_name: string; last_name: string; email: string }>> {
    const result = await query(
      `SELECT pm.*, u.first_name, u.last_name, u.email
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [projectId]
    );
    return Array.isArray(result) ? result : result.rows;
  }
}

