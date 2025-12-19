import { OfferModel, CreateOfferData, Offer } from '../models/Offer';
import { OfferItemModel } from '../models/OfferItem';
import { pdfService } from './pdf.service';
import { query } from '../config/database';
import { getRow } from '../utils/fix-models';

export class OfferService {
  static async getAllOffers() {
    return await OfferModel.findAll();
  }

  static async getOfferById(id: number) {
    const offer = await OfferModel.findById(id);
    if (!offer) {
      throw new Error('Offer not found');
    }
    // Load items
    const items = await OfferItemModel.findByOfferId(id);
    return { ...offer, items };
  }

  static async getOffersByStatus(status: string) {
    return await OfferModel.findByStatus(status);
  }

  static async getOffersByProject(projectId: number) {
    return await OfferModel.findByProject(projectId);
  }

  static async createOffer(data: CreateOfferData) {
    return await OfferModel.create(data);
  }

  static async createForProject(projectId: number, userId: number) {
    // Projekt-Daten laden für Kundenzuordnung
    const projectResult = await query(
      `SELECT p.*, p.customer_id as company_id FROM projects p 
       WHERE p.id = $1`,
      [projectId]
    );
    const project = getRow(projectResult);
    
    if (!project) {
      throw new Error('Projekt nicht gefunden');
    }

    // Gültigkeitsdatum: 30 Tage ab heute
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    return await OfferModel.create({
      project_id: projectId,
      customer_id: project.customer_id || project.company_id,
      amount: 0,
      tax_rate: 19.00,
      status: 'draft',
      valid_until: validUntil,
      created_by: userId,
    });
  }

  static async updateOffer(id: number, data: Partial<CreateOfferData>) {
    const offer = await OfferModel.findById(id);
    if (!offer) {
      throw new Error('Offer not found');
    }
    return await OfferModel.update(id, data);
  }

  static async deleteOffer(id: number) {
    const offer = await OfferModel.findById(id);
    if (!offer) {
      throw new Error('Offer not found');
    }
    await OfferModel.delete(id);
    return { message: 'Offer deleted successfully' };
  }

  static async finalize(id: number): Promise<Offer> {
    const offer = await OfferModel.findById(id);
    if (!offer) {
      throw new Error('Angebot nicht gefunden');
    }
    if (offer.status !== 'draft') {
      throw new Error('Nur Entwürfe können finalisiert werden');
    }

    // Finalisieren und offizielle Nummer vergeben
    return await OfferModel.finalize(id);
  }

  static async generatePreviewPdf(id: number): Promise<string> {
    const offerData = await this.getOfferById(id);
    
    // Kundendaten laden
    const customerResult = await query(
      `SELECT * FROM companies WHERE id = $1`,
      [offerData.customer_id]
    );
    const customer = getRow(customerResult);

    // Projektdaten laden
    let project = null;
    if (offerData.project_id) {
      const projectResult = await query(
        `SELECT * FROM projects WHERE id = $1`,
        [offerData.project_id]
      );
      project = getRow(projectResult);
    }

    // Summen berechnen
    const items = offerData.items || [];
    const regularItems = items.filter((i: any) => i.item_type !== 'optional' && i.item_type !== 'alternative');
    const totalNet = regularItems.reduce((sum: number, i: any) => sum + (i.total_price || 0), 0);
    const taxRate = offerData.tax_rate || 19;
    const totalTax = totalNet * (taxRate / 100);
    const totalGross = totalNet + totalTax;

    // PDF-Daten vorbereiten
    const pdfData = {
      offer_number: offerData.offer_number,
      date: new Date(offerData.created_at).toLocaleDateString('de-DE'),
      valid_until: offerData.valid_until 
        ? new Date(offerData.valid_until).toLocaleDateString('de-DE')
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
      customer: {
        name: customer?.name || 'Unbekannt',
        address: customer?.address || '',
        postal_code: customer?.postal_code || '',
        city: customer?.city || '',
      },
      project: project ? {
        name: project.name,
        address: project.address || '',
      } : undefined,
      items: items.map((item: any, index: number) => ({
        position: index + 1,
        description: item.name || item.description || '',
        long_description: item.description || '',
        quantity: item.quantity || 1,
        unit: item.unit || 'Stk',
        unit_price: item.unit_price || 0,
        total: item.total_price || 0,
        item_type: item.item_type,
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
        phone: '+49 123 456789',
        email: 'info@elite-pv.de',
        website: 'www.elite-pv.de',
        tax_number: 'DE123456789',
        bank_name: 'Sparkasse Musterstadt',
        iban: 'DE89 3704 0044 0532 0130 00',
        bic: 'COBADEFFXXX',
      },
    };

    // PDF als Base64 generieren
    return await pdfService.generateOfferPreview(pdfData);
  }

  static async generatePdf(id: number): Promise<Buffer> {
    const base64 = await this.generatePreviewPdf(id);
    return Buffer.from(base64, 'base64');
  }
}

