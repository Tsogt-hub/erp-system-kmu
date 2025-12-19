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

// Erstelle Tabelle falls nicht vorhanden
export async function initTasksTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      due_date TEXT,
      assigned_to INTEGER REFERENCES users(id),
      project_id INTEGER REFERENCES projects(id),
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function getAllTasks(userId?: number): Promise<Task[]> {
  const sql = userId
    ? `SELECT t.*, u.first_name || ' ' || u.last_name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.created_by = ? OR t.assigned_to = ?
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
     WHERE t.id = ?`,
    [id]
  );
  const rows = Array.isArray(result) ? result : result.rows || [];
  return rows[0] || null;
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  const result = await query(
    `INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, project_id, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
  
  const insertId = (result as any).lastInsertRowid || (result as any).insertId;
  return getTaskById(insertId) as Promise<Task>;
}

export async function updateTask(id: number, data: UpdateTaskData): Promise<Task | null> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    values.push(data.priority);
  }
  if (data.due_date !== undefined) {
    updates.push('due_date = ?');
    values.push(data.due_date);
  }
  if (data.assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    values.push(data.assigned_to);
  }
  if (data.project_id !== undefined) {
    updates.push('project_id = ?');
    values.push(data.project_id);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  await query(
    `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return getTaskById(id);
}

export async function deleteTask(id: number): Promise<boolean> {
  const result = await query('DELETE FROM tasks WHERE id = ?', [id]);
  return (result as any).changes > 0 || (result as any).rowCount > 0;
}







