import { parse } from 'csv-parse/sync';
import { ItemModel, CreateItemData } from '../models/Item';
import { logger } from '../utils/logger';

export interface ImportResult {
  success: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}

export class ImportService {
  static async importItemsFromCSV(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      errors: [],
      total: 0,
    };

    try {
      // Parse CSV
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      }) as Array<Record<string, string>>;

      result.total = records.length;

      // Process each row
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNumber = i + 2; // +2 because of header row and 0-index

        try {
          // Validate required fields
          if (!row.name || row.name.trim() === '') {
            result.errors.push({
              row: rowNumber,
              error: 'Name ist erforderlich',
            });
            continue;
          }

          // Create item data
          const itemData: CreateItemData = {
            name: row.name.trim(),
            sku: row.sku?.trim() || undefined,
            description: row.description?.trim() || undefined,
            unit: row.unit?.trim() || 'Stück',
            price: row.price ? parseFloat(row.price.replace(',', '.')) : 0,
            category: row.category?.trim() || undefined,
          };

          // Check if SKU already exists
          if (itemData.sku) {
            const existing = await ItemModel.findBySKU(itemData.sku);
            if (existing) {
              result.errors.push({
                row: rowNumber,
                error: `SKU "${itemData.sku}" existiert bereits`,
              });
              continue;
            }
          }

          // Create item
          await ItemModel.create(itemData);
          result.success++;

          logger.info(`✅ Import: Artikel "${itemData.name}" erstellt (Zeile ${rowNumber})`);
        } catch (error: any) {
          result.errors.push({
            row: rowNumber,
            error: error.message || 'Unbekannter Fehler',
          });
          logger.error(`❌ Import-Fehler Zeile ${rowNumber}:`, error.message);
        }
      }

      logger.info(`📊 Import abgeschlossen: ${result.success} erfolgreich, ${result.errors.length} Fehler`);
      return result;
    } catch (error: any) {
      logger.error('❌ CSV-Parsing-Fehler:', error.message);
      throw new Error(`Fehler beim Parsen der CSV-Datei: ${error.message}`);
    }
  }
}


















