// Test-Skript für PDF-Generierung mit Hero-Design
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ELITE_PV_COMPANY, ELITE_PV_OFFER_TEXTS } from './src/seeds/elite-pv-config';

// PDF-Einstellungen (übernommen aus Hero Software)
const settings = {
  primary_color: '#1976D2',      // Elite PV Blau
  secondary_color: '#FF9800',     // Elite PV Orange/Akzent
  font_family: 'Helvetica',
  font_size: 9,
  margin_top: 113,
  margin_right: 57,
  margin_bottom: 99,
  margin_left: 71,
  address_position_x: 71,
  address_position_y: 127,
  show_sender_line: true,
  show_fold_marks: true,
  footer_font_size: 7,
};

// Test-Angebot
const offer = {
  offer_number: 'ANG-2025-0001',
  title: 'PV-Anlage 10 kWp Komplett',
  created_at: new Date().toISOString(),
  valid_until: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
  company: ELITE_PV_COMPANY,
  customer: {
    name: 'Lorenz Gebhardt',
    address: 'Musterstraße 1',
    postal_code: '92637',
    city: 'Weiden',
  },
  project: {
    address: 'Musterstraße 1, 92637 Weiden',
  },
  items: [
    { position: 1, name: 'PV-Anlage 10 kWp Komplett', description: 'Komplette Photovoltaikanlage inkl. Montage', quantity: 1, unit: 'Stk', price: 18500, vat_rate: 19 },
  ],
};

// PDF erstellen
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: settings.margin_left, right: settings.margin_right }
});

const outputPath = path.join(__dirname, 'test-angebot.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Hilfsfunktion für Hex zu RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

const primaryRgb = hexToRgb(settings.primary_color);
const pageWidth = 595.28;
const leftMargin = settings.margin_left;
const contentWidth = pageWidth - settings.margin_left - settings.margin_right;

// ==================== HEADER ====================
// Firmenname links
doc.fontSize(20)
   .fillColor(primaryRgb)
   .font('Helvetica-Bold')
   .text(offer.company.name, leftMargin, 40, { width: 250 });

// Firmeninfo rechts
const companyInfoX = 350;
doc.fontSize(8)
   .fillColor([85, 85, 85])
   .font('Helvetica')
   .text(offer.company.street, companyInfoX, 40, { align: 'right', width: 195 })
   .text(`${offer.company.postal_code} ${offer.company.city}`, { align: 'right', width: 195 })
   .text(`Tel: ${offer.company.phone}`, { align: 'right', width: 195 })
   .text(`E-Mail: ${offer.company.email}`, { align: 'right', width: 195 });

// Falzmarken (wie in Hero konfiguriert)
if (settings.show_fold_marks) {
  doc.strokeColor([204, 204, 204])
     .lineWidth(0.5);
  // Obere Falzmarke (87mm = ~247pt)
  doc.moveTo(0, 247).lineTo(15, 247).stroke();
  // Mittlere Falzmarke (148.5mm = ~421pt)  
  doc.moveTo(0, 421).lineTo(15, 421).stroke();
}

// Absenderzeile wie in Hero
if (settings.show_sender_line) {
  doc.fontSize(7)
     .fillColor([102, 102, 102])
     .font('Helvetica')
     .text(
       `${offer.company.name}, ${offer.company.street}, ${offer.company.postal_code} ${offer.company.city}`,
       settings.address_position_x,
       settings.address_position_y,
       { width: contentWidth }
     );
}

// Trennlinie unter Absenderzeile
doc.moveTo(settings.address_position_x, settings.address_position_y + 12)
   .lineTo(settings.address_position_x + 200, settings.address_position_y + 12)
   .strokeColor([136, 136, 136])
   .lineWidth(0.5)
   .stroke();

// ==================== EMPFÄNGER-ADRESSE ====================
const recipientY = settings.address_position_y + 20;

doc.fontSize(11)
   .fillColor([0, 0, 0])
   .font('Helvetica-Bold')
   .text(offer.customer.name, settings.address_position_x, recipientY);

doc.fontSize(10)
   .font('Helvetica')
   .text(offer.customer.address || '', settings.address_position_x, recipientY + 15)
   .text(`${offer.customer.postal_code || ''} ${offer.customer.city || ''}`, settings.address_position_x, recipientY + 28);

// ==================== DOKUMENT-INFO-BOX ====================
const infoBoxX = 370;
const infoBoxY = recipientY - 5;

doc.rect(infoBoxX, infoBoxY, pageWidth - infoBoxX - settings.margin_right, 80)
   .fillColor([248, 248, 248])
   .fill();

doc.fontSize(8)
   .fillColor([100, 100, 100])
   .font('Helvetica')
   .text('Angebotsnummer:', infoBoxX + 10, infoBoxY + 10);

doc.font('Helvetica-Bold')
   .fillColor([0, 0, 0])
   .text(offer.offer_number, infoBoxX + 10, infoBoxY + 22);

doc.font('Helvetica')
   .fillColor([100, 100, 100])
   .text('Datum:', infoBoxX + 10, infoBoxY + 40);

doc.font('Helvetica-Bold')
   .fillColor([0, 0, 0])
   .text(new Date().toLocaleDateString('de-DE'), infoBoxX + 10, infoBoxY + 52);

// ==================== BETREFFZEILE / TITEL ====================
const mainBlockStart = 283;
let currentY = mainBlockStart;

// Betreffzeile 1: Projektadresse
if (offer.project?.address) {
  doc.fontSize(14)
     .fillColor([0, 0, 0])
     .font('Helvetica-Bold')
     .text(`BV: ${offer.project.address}`, leftMargin, currentY);
  currentY += 20;
}

// Betreffzeile 2: Angebotsnummer
doc.fontSize(14)
   .fillColor(primaryRgb)
   .font('Helvetica-Bold')
   .text(`Angebot ${offer.offer_number}`, leftMargin, currentY);

currentY += 30;

// ==================== EINLEITUNGSTEXT ====================
doc.fontSize(settings.font_size)
   .fillColor([0, 0, 0])
   .font('Helvetica')
   .text(ELITE_PV_OFFER_TEXTS.intro_text, leftMargin, currentY, {
     width: contentWidth,
     align: 'left',
   });

currentY = doc.y + 20;

// ==================== POSITIONEN ====================
// Tabellenkopf
const tableTop = currentY;
const colWidths = [40, 50, 280, 80];
const colX = [leftMargin, leftMargin + 40, leftMargin + 90, leftMargin + 370];

doc.rect(leftMargin, tableTop, contentWidth, 20)
   .fillColor(primaryRgb)
   .fill();

doc.fontSize(9)
   .fillColor([255, 255, 255])
   .font('Helvetica-Bold')
   .text('Pos', colX[0] + 5, tableTop + 5)
   .text('Menge', colX[1] + 5, tableTop + 5)
   .text('Bezeichnung', colX[2] + 5, tableTop + 5)
   .text('Gesamt', colX[3] + 5, tableTop + 5);

currentY = tableTop + 25;

// Positionen
let netTotal = 0;
for (const item of offer.items) {
  const lineTotal = item.quantity * item.price;
  netTotal += lineTotal;

  doc.fontSize(9)
     .fillColor([0, 0, 0])
     .font('Helvetica')
     .text(item.position.toString().padStart(3, '0'), colX[0] + 5, currentY)
     .text(`${item.quantity} ${item.unit}`, colX[1] + 5, currentY)
     .text(item.name, colX[2] + 5, currentY, { width: 270 });

  doc.font('Helvetica-Bold')
     .text(`${lineTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, colX[3] + 5, currentY);

  // Beschreibung
  if (item.description) {
    currentY += 15;
    doc.fontSize(8)
       .fillColor([100, 100, 100])
       .font('Helvetica')
       .text(item.description, colX[2] + 5, currentY, { width: 270 });
  }

  currentY += 25;
}

// ==================== SUMMEN ====================
currentY += 10;
const vatAmount = netTotal * 0.19;
const grossTotal = netTotal + vatAmount;

doc.moveTo(leftMargin, currentY)
   .lineTo(pageWidth - settings.margin_right, currentY)
   .strokeColor([200, 200, 200])
   .stroke();

currentY += 10;

doc.fontSize(10)
   .fillColor([0, 0, 0])
   .font('Helvetica')
   .text('Nettobetrag:', leftMargin, currentY, { width: 350, align: 'right' })
   .text(`${netTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, colX[3] + 5, currentY);

currentY += 15;
doc.text('zzgl. 19% MwSt.:', leftMargin, currentY, { width: 350, align: 'right' })
   .text(`${vatAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, colX[3] + 5, currentY);

currentY += 20;
doc.moveTo(leftMargin + 300, currentY)
   .lineTo(pageWidth - settings.margin_right, currentY)
   .strokeColor(primaryRgb)
   .lineWidth(2)
   .stroke();

currentY += 10;
doc.fontSize(12)
   .font('Helvetica-Bold')
   .fillColor(primaryRgb)
   .text('Gesamtsumme:', leftMargin, currentY, { width: 350, align: 'right' })
   .text(`${grossTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, colX[3] + 5, currentY);

// ==================== FUSSTEXT ====================
currentY += 40;
doc.fontSize(settings.font_size)
   .fillColor([0, 0, 0])
   .font('Helvetica')
   .text(ELITE_PV_OFFER_TEXTS.footer_text, leftMargin, currentY, {
     width: contentWidth,
     align: 'left',
   });

// ==================== FUSSZEILE ====================
const footerY = 800;
doc.fontSize(settings.footer_font_size)
   .fillColor([128, 128, 128])
   .font('Helvetica');

const footerCol1 = leftMargin;
const footerCol2 = 200;
const footerCol3 = 350;

doc.text(offer.company.name, footerCol1, footerY)
   .text(offer.company.street, footerCol1, footerY + 10)
   .text(`${offer.company.postal_code} ${offer.company.city}`, footerCol1, footerY + 20);

doc.text(`Tel: ${offer.company.phone}`, footerCol2, footerY)
   .text(`Mobil: ${offer.company.mobile}`, footerCol2, footerY + 10)
   .text(`E-Mail: ${offer.company.email}`, footerCol2, footerY + 20);

doc.text(offer.company.bank_name, footerCol3, footerY)
   .text(`IBAN: ${offer.company.iban}`, footerCol3, footerY + 10)
   .text(`BIC: ${offer.company.bic}`, footerCol3, footerY + 20);

// PDF abschließen
doc.end();

stream.on('finish', () => {
  console.log(`✅ PDF erfolgreich erstellt: ${outputPath}`);
});



