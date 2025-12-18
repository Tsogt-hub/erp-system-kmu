// PDF-Service für Dokumentengenerierung
// Verwendet Puppeteer für die Generierung

import puppeteer, { Browser } from 'puppeteer';
import { logger } from '../utils/logger';

export interface PDFOptions {
  format?: 'A4' | 'A5' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  header?: string;
  footer?: string;
}

// Standard-PDF-Vorlage für Angebote
export const OFFER_PDF_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #333;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2196F3;
    }
    .logo {
      max-width: 200px;
      max-height: 60px;
    }
    .company-info {
      text-align: right;
      font-size: 9pt;
    }
    .address-block {
      margin-bottom: 30px;
    }
    .address-block .sender {
      font-size: 8pt;
      color: #666;
      margin-bottom: 5px;
    }
    .address-block .recipient {
      font-size: 11pt;
    }
    .document-info {
      float: right;
      width: 200px;
      margin-bottom: 30px;
    }
    .document-info table {
      width: 100%;
      font-size: 9pt;
    }
    .document-info td {
      padding: 2px 0;
    }
    .document-info td:first-child {
      color: #666;
    }
    .document-title {
      font-size: 18pt;
      font-weight: bold;
      margin: 30px 0 20px 0;
      color: #2196F3;
    }
    .intro-text {
      margin-bottom: 20px;
      white-space: pre-line;
    }
    .positions-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .positions-table th {
      background-color: #2196F3;
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
    }
    .positions-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #eee;
      vertical-align: top;
    }
    .positions-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .positions-table .pos-nr {
      width: 50px;
    }
    .positions-table .pos-qty {
      width: 60px;
      text-align: center;
    }
    .positions-table .pos-unit {
      width: 60px;
      text-align: center;
    }
    .positions-table .pos-price {
      width: 100px;
      text-align: right;
    }
    .positions-table .pos-total {
      width: 100px;
      text-align: right;
      font-weight: 600;
    }
    .position-optional {
      color: #666;
      font-style: italic;
    }
    .position-optional td {
      color: #666;
    }
    .position-image {
      width: 60px;
      height: 60px;
      object-fit: contain;
      margin-right: 10px;
      float: left;
    }
    .position-description {
      font-weight: 500;
    }
    .position-details {
      font-size: 9pt;
      color: #666;
      margin-top: 5px;
    }
    .summary-block {
      float: right;
      width: 300px;
      margin-top: 20px;
    }
    .summary-block table {
      width: 100%;
    }
    .summary-block td {
      padding: 5px 10px;
    }
    .summary-block .label {
      text-align: right;
    }
    .summary-block .value {
      text-align: right;
      font-weight: 600;
    }
    .summary-block .total-row {
      background-color: #2196F3;
      color: white;
      font-size: 12pt;
    }
    .footer-text {
      clear: both;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      white-space: pre-line;
    }
    .footer-text h4 {
      margin-bottom: 10px;
      color: #2196F3;
    }
    .signature-block {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
    }
    .signature-field {
      width: 45%;
      border-top: 1px solid #333;
      padding-top: 5px;
      font-size: 9pt;
    }
    .page-footer {
      position: fixed;
      bottom: 20px;
      left: 40px;
      right: 40px;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 80pt;
      color: rgba(200, 200, 200, 0.3);
      font-weight: bold;
      pointer-events: none;
      z-index: -1;
    }
  </style>
</head>
<body>
  {{CONTENT}}
</body>
</html>
`;

class PDFService {
  private browser: Browser | null = null;

  // Browser-Instanz initialisieren (Singleton)
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  // Browser schließen
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // HTML zu PDF konvertieren
  async generateFromHTML(html: string, options: PDFOptions = {}): Promise<Buffer> {
    logger.info('PDF wird generiert', { options });

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        landscape: options.orientation === 'landscape',
        margin: options.margin || {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  // PDF-Vorschau als Base64 generieren
  async generatePreviewBase64(html: string, options: PDFOptions = {}): Promise<string> {
    const pdfBuffer = await this.generateFromHTML(html, options);
    return pdfBuffer.toString('base64');
  }

  // Angebot als PDF generieren
  async generateOffer(offer: {
    offer_number: string;
    date: string;
    valid_until: string;
    customer: {
      name: string;
      address: string;
      postal_code: string;
      city: string;
    };
    project?: {
      name: string;
      address: string;
    };
    items: Array<{
      position: number;
      description: string;
      long_description?: string;
      quantity: number;
      unit: string;
      unit_price: number;
      total: number;
      item_type?: string;
      image_url?: string;
    }>;
    intro_text?: string;
    footer_text?: string;
    payment_terms?: string;
    total_net: number;
    total_tax: number;
    tax_rate: number;
    total_gross: number;
    is_draft?: boolean;
    company: {
      name: string;
      address: string;
      phone: string;
      email: string;
      website: string;
      tax_number: string;
      bank_name: string;
      iban: string;
      bic: string;
    };
  }): Promise<Buffer> {
    // Positionen-HTML generieren
    const positionsHtml = offer.items.map(item => {
      const isOptional = item.item_type === 'optional' || item.item_type === 'alternative';
      const className = isOptional ? 'position-optional' : '';
      const prefix = item.item_type === 'optional' ? '(Bedarfsposition) ' : 
                     item.item_type === 'alternative' ? '(Alternative) ' : '';
      
      return `
        <tr class="${className}">
          <td class="pos-nr">${item.position.toString().padStart(3, '0')}</td>
          <td>
            ${item.image_url ? `<img src="${item.image_url}" class="position-image" />` : ''}
            <div class="position-description">${prefix}${item.description}</div>
            ${item.long_description ? `<div class="position-details">${item.long_description}</div>` : ''}
          </td>
          <td class="pos-qty">${item.quantity}</td>
          <td class="pos-unit">${item.unit}</td>
          <td class="pos-price">${formatCurrency(item.unit_price)}</td>
          <td class="pos-total">${isOptional ? `(${formatCurrency(item.total)})` : formatCurrency(item.total)}</td>
        </tr>
      `;
    }).join('');

    const content = `
      ${offer.is_draft ? '<div class="watermark">ENTWURF</div>' : ''}
      
      <div class="header">
        <div class="company-logo">
          <!-- Logo hier -->
        </div>
        <div class="company-info">
          <strong>${offer.company.name}</strong><br>
          ${offer.company.address}<br>
          Tel: ${offer.company.phone}<br>
          ${offer.company.email}<br>
          ${offer.company.website}
        </div>
      </div>

      <div class="address-block">
        <div class="sender">${offer.company.name} · ${offer.company.address}</div>
        <div class="recipient">
          ${offer.customer.name}<br>
          ${offer.customer.address}<br>
          ${offer.customer.postal_code} ${offer.customer.city}
        </div>
      </div>

      <div class="document-info">
        <table>
          <tr><td>Angebot Nr.:</td><td><strong>${offer.offer_number}</strong></td></tr>
          <tr><td>Datum:</td><td>${offer.date}</td></tr>
          <tr><td>Gültig bis:</td><td>${offer.valid_until}</td></tr>
          ${offer.project ? `<tr><td>Projekt:</td><td>${offer.project.name}</td></tr>` : ''}
        </table>
      </div>

      <div style="clear: both;"></div>

      <h1 class="document-title">Angebot ${offer.offer_number}</h1>

      ${offer.intro_text ? `<div class="intro-text">${offer.intro_text}</div>` : ''}

      <table class="positions-table">
        <thead>
          <tr>
            <th class="pos-nr">Pos.</th>
            <th>Beschreibung</th>
            <th class="pos-qty">Menge</th>
            <th class="pos-unit">Einheit</th>
            <th class="pos-price">Einzelpreis</th>
            <th class="pos-total">Gesamt</th>
          </tr>
        </thead>
        <tbody>
          ${positionsHtml}
        </tbody>
      </table>

      <div class="summary-block">
        <table>
          <tr>
            <td class="label">Nettobetrag:</td>
            <td class="value">${formatCurrency(offer.total_net)}</td>
          </tr>
          <tr>
            <td class="label">zzgl. ${offer.tax_rate}% MwSt.:</td>
            <td class="value">${formatCurrency(offer.total_tax)}</td>
          </tr>
          <tr class="total-row">
            <td class="label">Gesamtbetrag:</td>
            <td class="value">${formatCurrency(offer.total_gross)}</td>
          </tr>
        </table>
      </div>

      <div style="clear: both;"></div>

      ${offer.payment_terms ? `
        <div class="footer-text">
          <h4>Zahlungsbedingungen</h4>
          <p>${offer.payment_terms}</p>
        </div>
      ` : ''}

      ${offer.footer_text ? `
        <div class="footer-text">
          ${offer.footer_text}
        </div>
      ` : ''}

      <div class="signature-block">
        <div class="signature-field">Ort, Datum / Unterschrift Kunde</div>
        <div class="signature-field">Unterschrift ${offer.company.name}</div>
      </div>

      <div class="page-footer">
        ${offer.company.name} · ${offer.company.address} · Steuernr.: ${offer.company.tax_number}<br>
        ${offer.company.bank_name} · IBAN: ${offer.company.iban} · BIC: ${offer.company.bic}
      </div>
    `;

    const html = OFFER_PDF_TEMPLATE.replace('{{CONTENT}}', content);
    
    return this.generateFromHTML(html, {
      format: 'A4',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });
  }

  // Angebot-Vorschau als Base64
  async generateOfferPreview(offer: Parameters<typeof this.generateOffer>[0]): Promise<string> {
    const pdfBuffer = await this.generateOffer({ ...offer, is_draft: true });
    return pdfBuffer.toString('base64');
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export const pdfService = new PDFService();
