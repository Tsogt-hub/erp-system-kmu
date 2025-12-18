import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../data/erp_system_kmu.sqlite');

// Erstelle data-Verzeichnis falls nicht vorhanden
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Test connection
console.log('✅ SQLite Database connected:', dbPath);

export const query = async (text: string, params: any[] = []) => {
  // Konvertiere Parameter zu SQLite-kompatiblen Typen
  const convertedParams = params.map(param => {
    if (param instanceof Date) {
      return param.toISOString();
    } else if (param === undefined) {
      return null;
    } else if (typeof param === 'boolean') {
      return param ? 1 : 0;
    }
    return param;
  });
  
  try {
    // Konvertiere PostgreSQL-Syntax zu SQLite
    let sqliteText = text;
    
    // Prüfe ob PostgreSQL-Style $1, $2 Platzhalter vorhanden sind
    const pgParamMatches = [...text.matchAll(/\$(\d+)/g)];
    const hasPgParams = pgParamMatches.length > 0;
    
    // Prüfe ob SQLite-Style ? Platzhalter vorhanden sind
    const sqliteParamCount = (text.match(/\?/g) || []).length;
    const hasSqliteParams = sqliteParamCount > 0;
    
    if (hasPgParams) {
      // PostgreSQL-Style: Ersetze $N mit ?
      sqliteText = text.replace(/\$(\d+)/g, '?');
    }
    
    // Für RETURNING Statements (SQLite unterstützt das nicht direkt)
    const hasReturning = sqliteText.toUpperCase().includes('RETURNING');
    let returnCols = '*';
    let tableName = '';
    
    if (hasReturning) {
      const returnMatch = sqliteText.match(/RETURNING (.+)/i);
      if (returnMatch) {
        returnCols = returnMatch[1].trim();
      }
      sqliteText = sqliteText.replace(/\s+RETURNING .+$/i, '');
      
      // Extrahiere Tabellennamen
      const insertMatch = sqliteText.match(/INSERT INTO (\w+)/i);
      const updateMatch = sqliteText.match(/UPDATE (\w+)/i);
      tableName = insertMatch ? insertMatch[1] : (updateMatch ? updateMatch[1] : '');
    }
    
    const stmt = db.prepare(sqliteText);
    const upperText = sqliteText.trim().toUpperCase();
    
    // Prüfe ob es ein SELECT ist
    if (upperText.startsWith('SELECT')) {
      if (convertedParams.length > 0) {
        const result = stmt.all(...convertedParams);
        return { rows: result, rowCount: result.length };
      }
      const result = stmt.all();
      return { rows: result, rowCount: result.length };
    } 
    
    // INSERT
    else if (upperText.startsWith('INSERT')) {
      let info;
      if (convertedParams.length > 0) {
        info = stmt.run(...convertedParams);
      } else {
        info = stmt.run();
      }
      
      if (hasReturning && tableName) {
        const lastId = info.lastInsertRowid;
        const selectStmt = db.prepare(`SELECT ${returnCols} FROM ${tableName} WHERE id = ?`);
        const result = selectStmt.get(lastId);
        return { rows: result ? [result] : [], rowCount: result ? 1 : 0, lastInsertRowid: lastId };
      }
      return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
    } 
    
    // UPDATE
    else if (upperText.startsWith('UPDATE')) {
      let info;
      if (convertedParams.length > 0) {
        info = stmt.run(...convertedParams);
      } else {
        info = stmt.run();
      }
      
      if (hasReturning && tableName && convertedParams.length > 0) {
        // Extrahiere ID aus WHERE-Klausel (normalerweise der letzte Parameter)
        const id = convertedParams[convertedParams.length - 1];
        const selectStmt = db.prepare(`SELECT ${returnCols} FROM ${tableName} WHERE id = ?`);
        const result = selectStmt.get(id);
        return { rows: result ? [result] : [], rowCount: info.changes };
      }
      return { rows: [], rowCount: info.changes };
    } 
    
    // DELETE oder andere
    else {
      let info;
      if (convertedParams.length > 0) {
        info = stmt.run(...convertedParams);
      } else {
        info = stmt.run();
      }
      return { rows: [], rowCount: info.changes };
    }
  } catch (error) {
    console.error('SQLite query error:', error);
    console.error('Query:', text);
    console.error('Original params:', params);
    console.error('Converted params:', convertedParams);
    throw error;
  }
};

export const queryOne = async (text: string, params: any[] = []) => {
  try {
    // Konvertiere Parameter
    const convertedParams = params.map(param => {
      if (param instanceof Date) {
        return param.toISOString();
      } else if (param === undefined) {
        return null;
      } else if (typeof param === 'boolean') {
        return param ? 1 : 0;
      }
      return param;
    });
    
    // Konvertiere PostgreSQL-Syntax
    let sqliteText = text.replace(/\$(\d+)/g, '?');
    
    const stmt = db.prepare(sqliteText);
    const result = convertedParams.length > 0 ? stmt.get(...convertedParams) : stmt.get();
    return result ? { rows: [result] } : { rows: [] };
  } catch (error) {
    console.error('SQLite query error:', error);
    throw error;
  }
};
