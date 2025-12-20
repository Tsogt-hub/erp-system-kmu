import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

// Datei-Typen
export const FILE_TYPES = [
  'image',
  'document',
  'pdf',
  'spreadsheet',
  'presentation',
  'archive',
  'other',
];

// Datei-Kategorien
export const FILE_CATEGORIES = [
  'Allgemein',
  'Angebot',
  'Vertrag',
  'Rechnung',
  'Foto',
  'Technische Zeichnung',
  'Datenblatt',
  'Zertifikat',
  'Protokoll',
  'Korrespondenz',
  'Sonstige',
];

export interface EntityFile {
  id: number;
  entity_type: 'project' | 'contact' | 'company' | 'offer' | 'document';
  entity_id: number;
  file_name: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  category?: string;
  description?: string;
  is_public: boolean;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  uploaded_by_name?: string;
}

export interface CreateEntityFileData {
  entity_type: 'project' | 'contact' | 'company' | 'offer' | 'document';
  entity_id: number;
  file_name: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  category?: string;
  description?: string;
  is_public?: boolean;
  uploaded_by: number;
}

export async function initEntityFilesTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS entity_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        category TEXT,
        description TEXT,
        is_public INTEGER DEFAULT 0,
        uploaded_by INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )
    `, []);

    // Index für schnelle Suche
    await query(`
      CREATE INDEX IF NOT EXISTS idx_entity_files_entity 
      ON entity_files(entity_type, entity_id)
    `, []);

    console.log('✅ Entity files table initialized');
  } catch (error: any) {
    console.log('ℹ️ Entity files table already exists or error:', error.message);
  }
}

export class EntityFileModel {
  static async findById(id: number): Promise<EntityFile | null> {
    const result = await query(
      `SELECT ef.*, u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM entity_files ef
       LEFT JOIN users u ON ef.uploaded_by = u.id
       WHERE ef.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findByEntity(entityType: string, entityId: number, category?: string): Promise<EntityFile[]> {
    let queryText = `
      SELECT ef.*, u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM entity_files ef
      LEFT JOIN users u ON ef.uploaded_by = u.id
      WHERE ef.entity_type = $1 AND ef.entity_id = $2
    `;
    const params: any[] = [entityType, entityId];

    if (category) {
      queryText += ` AND ef.category = $3`;
      params.push(category);
    }

    queryText += ` ORDER BY ef.created_at DESC`;

    const result = await query(queryText, params);
    return getRows(result);
  }

  static async findImages(entityType: string, entityId: number): Promise<EntityFile[]> {
    const result = await query(
      `SELECT ef.*, u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM entity_files ef
       LEFT JOIN users u ON ef.uploaded_by = u.id
       WHERE ef.entity_type = $1 AND ef.entity_id = $2 AND ef.file_type = 'image'
       ORDER BY ef.created_at DESC`,
      [entityType, entityId]
    );
    return getRows(result);
  }

  static async findDocuments(entityType: string, entityId: number): Promise<EntityFile[]> {
    const result = await query(
      `SELECT ef.*, u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM entity_files ef
       LEFT JOIN users u ON ef.uploaded_by = u.id
       WHERE ef.entity_type = $1 AND ef.entity_id = $2 AND ef.file_type != 'image'
       ORDER BY ef.created_at DESC`,
      [entityType, entityId]
    );
    return getRows(result);
  }

  static async create(data: CreateEntityFileData): Promise<EntityFile> {
    const result = await query(
      `INSERT INTO entity_files (entity_type, entity_id, file_name, original_name, file_path, file_type, file_size, mime_type, category, description, is_public, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        data.entity_type,
        data.entity_id,
        data.file_name,
        data.original_name,
        data.file_path,
        data.file_type,
        data.file_size,
        data.mime_type,
        data.category || null,
        data.description || null,
        data.is_public ? 1 : 0,
        data.uploaded_by,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateEntityFileData>): Promise<EntityFile> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && !['entity_type', 'entity_id', 'uploaded_by'].includes(key)) {
        if (key === 'is_public' && typeof value === 'boolean') {
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
      `UPDATE entity_files SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM entity_files WHERE id = $1', [id]);
  }

  static async deleteByEntity(entityType: string, entityId: number): Promise<void> {
    await query('DELETE FROM entity_files WHERE entity_type = $1 AND entity_id = $2', [entityType, entityId]);
  }

  static async countByEntity(entityType: string, entityId: number): Promise<{ images: number; documents: number; total: number }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN file_type = 'image' THEN 1 ELSE 0 END) as images,
        SUM(CASE WHEN file_type != 'image' THEN 1 ELSE 0 END) as documents
       FROM entity_files
       WHERE entity_type = $1 AND entity_id = $2`,
      [entityType, entityId]
    );
    const row = getRow(result);
    return {
      images: row?.images || 0,
      documents: row?.documents || 0,
      total: row?.total || 0,
    };
  }

  // Helper to determine file type from mime type
  static getFileTypeFromMime(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
    return 'other';
  }
}








