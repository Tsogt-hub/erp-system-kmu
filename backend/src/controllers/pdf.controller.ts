import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { OfferService } from '../services/offer.service';
import { pdfService } from '../services/pdf.service';
import { query } from '../config/database';
import { getRow } from '../utils/fix-models';

export class PDFController {
  static async generateOfferPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const offerData = await OfferService.getOfferById(id);

      if (!offerData) {
        return res.status(404).json({ error: 'Angebot nicht gefunden' });
      }

      // Kundendaten laden (aus contacts oder companies)
      let customer = null;
      if (offerData.customer_id) {
        // Zuerst in contacts suchen
        const contactResult = await query(
          `SELECT * FROM contacts WHERE id = $1`,
          [offerData.customer_id]
        );
        customer = getRow(contactResult);
        
        // Falls nicht gefunden, in companies suchen
        if (!customer) {
          const companyResult = await query(
            `SELECT * FROM companies WHERE id = $1`,
            [offerData.customer_id]
          );
          customer = getRow(companyResult);
        }
      }

      // Projektdaten laden
      let project = null;
      if (offerData.project_id) {
        const projectResult = await query(
          `SELECT * FROM projects WHERE id = $1`,
          [offerData.project_id]
        );
        project = getRow(projectResult);
      }

      // Positionen laden und formatieren
      const items = offerData.items || [];
      const regularItems = items.filter((i: any) => 
        i.item_type !== 'optional' && i.item_type !== 'alternative'
      );
      
      // Summen berechnen
      const totalNet = regularItems.reduce((sum: number, i: any) => {
        const price = i.unit_price || 0;
        const qty = i.quantity || 1;
        const discount = i.discount_percent || 0;
        return sum + (price * qty * (1 - discount / 100));
      }, 0);
      
      const taxRate = offerData.tax_rate || 19;
      const totalTax = totalNet * (taxRate / 100);
      const totalGross = totalNet + totalTax;

      // Kundenname zusammenbauen
      const customerName = customer 
        ? (customer.first_name && customer.last_name 
            ? `${customer.first_name} ${customer.last_name}`
            : customer.name || 'Unbekannt')
        : 'Unbekannt';

      // PDF-Daten vorbereiten
      const pdfData = {
        offer_number: offerData.offer_number,
        date: new Date(offerData.created_at).toLocaleDateString('de-DE'),
        valid_until: offerData.valid_until 
          ? new Date(offerData.valid_until).toLocaleDateString('de-DE')
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
        customer: {
          name: customerName,
          address: customer?.street || customer?.address || '',
          postal_code: customer?.postal_code || customer?.zip || '',
          city: customer?.city || '',
        },
        project: project ? {
          name: project.name,
          address: project.address || '',
        } : undefined,
        items: items.map((item: any, index: number) => ({
          position: index + 1,
          description: item.description || item.name || '',
          long_description: item.long_description || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'Stk',
          unit_price: item.unit_price || 0,
          total: (item.unit_price || 0) * (item.quantity || 1) * (1 - (item.discount_percent || 0) / 100),
          item_type: item.item_type || 'standard',
          image_url: item.image_url,
        })),
        intro_text: offerData.intro_text || 'Vielen Dank für Ihr Interesse. Gerne unterbreiten wir Ihnen folgendes Angebot:',
        footer_text: offerData.footer_text || '',
        payment_terms: offerData.payment_terms || 'Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt ohne Abzug.',
        total_net: totalNet,
        total_tax: totalTax,
        tax_rate: taxRate,
        total_gross: totalGross,
        is_draft: offerData.status === 'draft',
        company: {
          name: 'Elite PV GmbH',
          address: 'Musterstraße 1, 12345 Musterstadt',
          street: 'Musterstraße 1',
          postal_code: '12345',
          city: 'Musterstadt',
          phone: '+49 123 456789',
          email: 'info@elite-pv.de',
          website: 'www.elite-pv.de',
          tax_number: 'DE123456789',
          bank_name: 'Sparkasse Musterstadt',
          iban: 'DE89 3704 0044 0532 0130 00',
          bic: 'COBADEFFXXX',
        },
      };

      // PDF generieren
      const pdfBuffer = await pdfService.generateOffer(pdfData);

      // PDF als Download senden
      const filename = `Angebot-${offerData.offer_number}-${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('PDF generation error:', error);
      next(error);
    }
  }
}


















