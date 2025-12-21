import { query } from '../config/database';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: number;
  project_id?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: number;
  project_id?: number;
  created_by: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: number;
  project_id?: number;
}

// Erstelle Tabelle falls nicht vorhanden (PostgreSQL-kompatibel)
export async function initTasksTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'todo',
      priority VARCHAR(20) DEFAULT 'medium',
      due_date DATE,
      assigned_to INTEGER REFERENCES users(id),
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function getAllTasks(userId?: number): Promise<Task[]> {
  const sql = userId
    ? `SELECT t.*, u.first_name || ' ' || u.last_name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.created_by = $1 OR t.assigned_to = $2
       ORDER BY t.created_at DESC`
    : `SELECT t.*, u.first_name || ' ' || u.last_name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       ORDER BY t.created_at DESC`;
  
  const result = await query(sql, userId ? [userId, userId] : []);
  return Array.isArray(result) ? result : result.rows || [];
}

export async function getTaskById(id: number): Promise<Task | null> {
  const result = await query(
    `SELECT t.*, u.first_name || ' ' || u.last_name as assigned_to_name
     FROM tasks t
     LEFT JOIN users u ON t.assigned_to = u.id
     WHERE t.id = $1`,
    [id]
  );
  const rows = Array.isArray(result) ? result : result.rows || [];
  return rows[0] || null;
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  const result = await query(
    `INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, project_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.title,
      data.description || null,
      data.status || 'todo',
      data.priority || 'medium',
      data.due_date || null,
      data.assigned_to || null,
      data.project_id || null,
      data.created_by,
    ]
  );
  
  // PostgreSQL: result.rows[0], SQLite: result via RETURNING simulation
  const rows = Array.isArray(result) ? result : result.rows || [];
  return rows[0] as Task;
}

export async function updateTask(id: number, data: UpdateTaskData): Promise<Task | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(data.status);
  }
  if (data.priority !== undefined) {
    updates.push(`priority = $${paramCount++}`);
    values.push(data.priority);
  }
  if (data.due_date !== undefined) {
    updates.push(`due_date = $${paramCount++}`);
    values.push(data.due_date);
  }
  if (data.assigned_to !== undefined) {
    updates.push(`assigned_to = $${paramCount++}`);
    values.push(data.assigned_to);
  }
  if (data.project_id !== undefined) {
    updates.push(`project_id = $${paramCount++}`);
    values.push(data.project_id);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const result = await query(
    `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  const rows = Array.isArray(result) ? result : result.rows || [];
  return rows[0] || null;
}

export async function deleteTask(id: number): Promise<boolean> {
  const result = await query('DELETE FROM tasks WHERE id = $1', [id]);
  return (result as any).changes > 0 || (result as any).rowCount > 0;
}









