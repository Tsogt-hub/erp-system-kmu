import PDFDocument from 'pdfkit';
import { Offer } from '../models/Offer';
import { OfferItem } from '../models/OfferItem';

interface OfferWithItems extends Offer {
  items?: OfferItem[];
}

export class PDFService {
  static async generateOfferPDF(offer: OfferWithItems): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('ANGEBOT', { align: 'center' });
        doc.moveDown();

        // Angebotsnummer
        doc.fontSize(12).text(`Angebotsnummer: ${offer.offer_number}`, { align: 'left' });
        doc.text(`Datum: ${new Date(offer.created_at).toLocaleDateString('de-DE')}`, { align: 'left' });
        
        if (offer.valid_until) {
          doc.text(`Gültig bis: ${new Date(offer.valid_until).toLocaleDateString('de-DE')}`, { align: 'left' });
        }
        
        doc.moveDown();

        // Kunde
        if (offer.customer_name) {
          doc.fontSize(14).text('An:', { underline: true });
          doc.fontSize(12).text(offer.customer_name);
          doc.moveDown();
        }

        // Positionen
        doc.fontSize(14).text('Positionen:', { underline: true });
        doc.moveDown(0.5);

        const items = offer.items || [];
        let yPosition = doc.y;
        const startY = yPosition;
        const pageHeight = doc.page.height;
        const margin = 50;
        const bottomMargin = 50;

        // Tabelle Header
        doc.fontSize(10);
        doc.text('Pos.', margin, yPosition);
        doc.text('Beschreibung', margin + 50, yPosition, { width: 250 });
        doc.text('Menge', margin + 300, yPosition, { width: 60, align: 'right' });
        doc.text('Einzelpreis', margin + 360, yPosition, { width: 70, align: 'right' });
        doc.text('Gesamt', margin + 430, yPosition, { width: 80, align: 'right' });

        yPosition += 20;
        doc.moveTo(margin, yPosition).lineTo(margin + 510, yPosition).stroke();
        yPosition += 10;

        // Positionen
        items.forEach((item, index) => {
          const subtotal = item.quantity * item.unit_price;
          const discount = item.discount_percent ? (subtotal * item.discount_percent / 100) : 0;
          const itemTotal = subtotal - discount;

          // Check if we need a new page
          if (yPosition > pageHeight - bottomMargin - 100) {
            doc.addPage();
            yPosition = margin;
          }

          doc.fontSize(9);
          doc.text(`${index + 1}.`, margin, yPosition);
          doc.text(item.description, margin + 50, yPosition, { width: 250 });
          doc.text(`${item.quantity} ${item.unit}`, margin + 300, yPosition, { width: 60, align: 'right' });
          doc.text(`${item.unit_price.toFixed(2)} €`, margin + 360, yPosition, { width: 70, align: 'right' });
          doc.text(`${itemTotal.toFixed(2)} €`, margin + 430, yPosition, { width: 80, align: 'right' });

          yPosition += 20;
        });

        // Gesamtsummen
        if (yPosition > pageHeight - bottomMargin - 150) {
          doc.addPage();
          yPosition = margin;
        }

        doc.moveDown(2);
        yPosition = doc.y;

        const subtotal = items.reduce((sum, item) => {
          const itemSubtotal = item.quantity * item.unit_price;
          const discount = item.discount_percent ? (itemSubtotal * item.discount_percent / 100) : 0;
          return sum + itemSubtotal - discount;
        }, 0);

        const tax = items.reduce((sum, item) => {
          const itemSubtotal = item.quantity * item.unit_price;
          const discount = item.discount_percent ? (itemSubtotal * item.discount_percent / 100) : 0;
          const itemTotal = itemSubtotal - discount;
          return sum + (itemTotal * item.tax_rate / 100);
        }, 0);

        const total = subtotal + tax;

        doc.fontSize(10);
        doc.text(`Zwischensumme (netto):`, margin + 300, yPosition, { width: 150, align: 'right' });
        doc.text(`${subtotal.toFixed(2)} €`, margin + 430, yPosition, { width: 80, align: 'right' });
        yPosition += 20;

        doc.text(`MwSt. (19%):`, margin + 300, yPosition, { width: 150, align: 'right' });
        doc.text(`${tax.toFixed(2)} €`, margin + 430, yPosition, { width: 80, align: 'right' });
        yPosition += 20;

        doc.moveTo(margin + 300, yPosition).lineTo(margin + 510, yPosition).stroke();
        yPosition += 10;

        doc.fontSize(14).font('Helvetica-Bold');
        doc.text(`Gesamt (brutto):`, margin + 300, yPosition, { width: 150, align: 'right' });
        doc.text(`${total.toFixed(2)} €`, margin + 430, yPosition, { width: 80, align: 'right' });

        // Notizen
        if (offer.notes) {
          doc.moveDown(2);
          doc.fontSize(10).font('Helvetica');
          doc.text('Bemerkungen:', { underline: true });
          doc.text(offer.notes, { width: 500 });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

