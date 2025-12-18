/**
 * Hero Software - Vollständiger CSV Import
 * Importiert alle 1.128 Artikel aus der Hero CSV-Datei
 */

import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

interface HeroArticle {
  sku: string;
  name: string;
  category: string;
  description: string;
  purchase_price: number;
  supplier_number: string;
  updated_at: string;
  sales_price: number;
  unit: string;
}

/**
 * Parst eine CSV-Zeile im deutschen Format (Semikolon-getrennt, Anführungszeichen)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Parst einen deutschen Preis-String (z.B. "57,00 €/Stk") zu einer Zahl
 */
function parseGermanPrice(priceStr: string): { price: number; unit: string } {
  if (!priceStr || priceStr.trim() === '') {
    return { price: 0, unit: 'Stk' };
  }
  
  // Entferne Leerzeichen
  const cleaned = priceStr.trim();
  
  // Extrahiere Einheit (z.B. "Stk", "m²", "pauschal")
  const unitMatch = cleaned.match(/€\/(\S+)$/);
  const unit = unitMatch ? unitMatch[1] : 'Stk';
  
  // Extrahiere Preis
  const priceMatch = cleaned.match(/^([\d.,]+)/);
  if (!priceMatch) {
    return { price: 0, unit };
  }
  
  // Konvertiere deutsches Format (1.234,56) zu Zahl
  let priceNumber = priceMatch[1]
    .replace(/\./g, '')  // Entferne Tausendertrennzeichen
    .replace(',', '.');  // Ersetze Dezimalkomma durch Punkt
  
  return { price: parseFloat(priceNumber) || 0, unit };
}

/**
 * Parst die komplette CSV-Datei und gibt Artikel zurück
 */
function parseHeroCSV(csvContent: string): HeroArticle[] {
  const lines = csvContent.split('\n');
  const articles: HeroArticle[] = [];
  
  // Überspringe Header-Zeile
  let i = 1;
  
  while (i < lines.length) {
    let line = lines[i];
    
    // Überspringe leere Zeilen
    if (!line.trim()) {
      i++;
      continue;
    }
    
    // Sammle mehrzeilige Einträge (wenn Beschreibung Zeilenumbrüche enthält)
    while (i < lines.length - 1) {
      const quoteCount = (line.match(/"/g) || []).length;
      if (quoteCount % 2 === 0) {
        break;
      }
      i++;
      line += '\n' + lines[i];
    }
    
    const fields = parseCSVLine(line);
    
    if (fields.length >= 7 && fields[0]) {
      const purchaseInfo = parseGermanPrice(fields[4]);
      const salesInfo = parseGermanPrice(fields[7] || fields[4]);
      
      articles.push({
        sku: fields[0],
        name: fields[1],
        category: fields[2] || 'Sonstige',
        description: fields[3],
        purchase_price: purchaseInfo.price,
        supplier_number: fields[5],
        updated_at: fields[6],
        sales_price: salesInfo.price,
        unit: purchaseInfo.unit || salesInfo.unit || 'Stk'
      });
    }
    
    i++;
  }
  
  return articles;
}

/**
 * Berechnet die Marge zwischen EK und VK
 */
function calculateMargin(purchasePrice: number, salesPrice: number): number {
  if (purchasePrice <= 0 || salesPrice <= 0) return 0;
  return Math.round(((salesPrice - purchasePrice) / purchasePrice) * 100 * 100) / 100;
}

/**
 * Importiert alle Artikel aus der CSV-Datei in die Datenbank
 */
export async function importHeroArticlesFromCSV(): Promise<{ imported: number; skipped: number; errors: number }> {
  const csvPath = path.join(__dirname, 'hero-articles-full.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('❌ CSV-Datei nicht gefunden:', csvPath);
    return { imported: 0, skipped: 0, errors: 0 };
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const articles = parseHeroCSV(csvContent);
  
  console.log(`📦 ${articles.length} Artikel aus CSV gelesen`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const article of articles) {
    try {
      // Prüfe ob Artikel bereits existiert
      const existing = await query(
        'SELECT id FROM items WHERE sku = $1',
        [article.sku]
      );
      
      if (existing && (existing as any[]).length > 0) {
        // Update existierenden Artikel
        await query(
          `UPDATE items SET 
            name = $1, 
            description = $2, 
            category = $3,
            unit = $4,
            purchase_price = $5,
            sales_price = $6,
            price = $7,
            margin_percent = $8,
            updated_at = CURRENT_TIMESTAMP
          WHERE sku = $9`,
          [
            article.name,
            article.description,
            article.category,
            article.unit,
            article.purchase_price,
            article.sales_price,
            article.sales_price,
            calculateMargin(article.purchase_price, article.sales_price),
            article.sku
          ]
        );
        skipped++;
      } else {
        // Neuen Artikel erstellen
        await query(
          `INSERT INTO items (
            sku, name, description, category, unit, 
            purchase_price, sales_price, price, margin_percent,
            is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            article.sku,
            article.name,
            article.description,
            article.category,
            article.unit,
            article.purchase_price,
            article.sales_price,
            article.sales_price,
            calculateMargin(article.purchase_price, article.sales_price)
          ]
        );
        imported++;
      }
    } catch (error: any) {
      console.error(`❌ Fehler bei Artikel ${article.sku}:`, error.message);
      errors++;
    }
  }
  
  console.log(`✅ Import abgeschlossen:`);
  console.log(`   - Neu importiert: ${imported}`);
  console.log(`   - Aktualisiert: ${skipped}`);
  console.log(`   - Fehler: ${errors}`);
  
  return { imported, skipped, errors };
}

