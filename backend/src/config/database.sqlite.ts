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
      // Konvertiere Date zu ISO-String
      return param.toISOString();
    } else if (param === undefined) {
      // Konvertiere undefined zu null
      return null;
    } else if (typeof param === 'boolean') {
      // Konvertiere boolean zu 0/1 für SQLite
      return param ? 1 : 0;
    }
    return param;
  });
  
  try {
    // Konvertiere PostgreSQL-Syntax zu SQLite
    let sqliteText = text;
    
    // Ersetze $1, $2, etc. mit ? für SQLite
    // Finde alle Parameter-Platzhalter und deren Positionen
    const paramMatches = [...text.matchAll(/\$(\d+)/g)];
    
    const hasParams = paramMatches.length > 0;
    let maxParamNum = 0;
    
    if (!hasParams) {
      // Keine Parameter-Platzhalter
      sqliteText = text;
    } else {
      // Extrahiere alle Parameter-Nummern
      const paramNumbers = paramMatches.map(m => parseInt(m[1]));
      maxParamNum = Math.max(...paramNumbers);
      
      // Ersetze $N mit ?
      sqliteText = text.replace(/\$(\d+)/g, '?');
      
      // Stelle sicher, dass wir genug Parameter haben
      // Nur prüfen, wenn tatsächlich Parameter erwartet werden
      if (maxParamNum > 0 && convertedParams.length < maxParamNum) {
        throw new Error(`Too few parameter values: expected ${maxParamNum}, got ${convertedParams.length}`);
      }
    }
    
    // Verwende konvertierte Parameter
    const orderedParams = hasParams ? convertedParams : [];
    
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
    
    // Prüfe ob es ein SELECT ist
    if (sqliteText.trim().toUpperCase().startsWith('SELECT')) {
      // Wenn keine Parameter-Platzhalter vorhanden sind ODER keine Parameter übergeben wurden ODER nicht genug Parameter vorhanden sind, führe ohne Parameter aus
      if (!hasParams || convertedParams.length === 0 || (maxParamNum > 0 && convertedParams.length < maxParamNum)) {
        const result = stmt.all();
        return { rows: result, rowCount: result.length };
      }
      // Ansonsten mit Parametern
      const result = stmt.all(...convertedParams);
      return { rows: result, rowCount: result.length };
    } else if (sqliteText.trim().toUpperCase().startsWith('INSERT')) {
      if (hasParams) {
        stmt.run(...convertedParams);
      } else {
        stmt.run();
      }
      
      if (hasReturning && tableName) {
        const lastId = db.prepare('SELECT last_insert_rowid() as id').get() as any;
        const selectStmt = db.prepare(`SELECT ${returnCols} FROM ${tableName} WHERE id = ?`);
        const result = selectStmt.get(lastId.id);
        return { rows: result ? [result] : [], rowCount: result ? 1 : 0 };
      }
      return { rows: [], rowCount: 0 };
    } else if (sqliteText.trim().toUpperCase().startsWith('UPDATE')) {
      if (hasParams) {
        stmt.run(...convertedParams);
      } else {
        stmt.run();
      }
      
      if (hasReturning && tableName && hasParams) {
        // Extrahiere ID aus WHERE-Klausel
        const idMatch = sqliteText.match(/WHERE id = \?/);
        if (idMatch && convertedParams.length > 0) {
          const id = convertedParams[convertedParams.length - 1];
          const selectStmt = db.prepare(`SELECT ${returnCols} FROM ${tableName} WHERE id = ?`);
          const result = selectStmt.get(id);
          return { rows: result ? [result] : [], rowCount: result ? 1 : 0 };
        }
      }
      return { rows: [], rowCount: 0 };
    } else {
      // DELETE oder andere
      if (hasParams) {
        stmt.run(...convertedParams);
      } else {
        stmt.run();
      }
      return { rows: [], rowCount: 0 };
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
    const stmt = db.prepare(text);
    const result = stmt.get(...params);
    return result ? { rows: [result] } : { rows: [] };
  } catch (error) {
    console.error('SQLite query error:', error);
    throw error;
  }
};

