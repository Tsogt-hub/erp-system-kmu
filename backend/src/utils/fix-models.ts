// Helper-Funktion für alle Modelle, um sowohl PostgreSQL als auch SQLite zu unterstützen
export function getRows(result: any): any[] {
  if (Array.isArray(result)) {
    return result;
  }
  return result.rows || [];
}

export function getRow(result: any): any | null {
  const rows = getRows(result);
  return rows[0] || null;
}








