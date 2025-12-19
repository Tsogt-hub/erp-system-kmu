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

// Anpassbare Firmenfarben (können über Einstellungen geändert werden)
export interface PDFBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily: string;
}

export const DEFAULT_BRANDING: PDFBranding = {
  primaryColor: '#1976D2', // Elite PV Blau
  secondaryColor: '#FF9800', // Akzentfarbe
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
};

// Standard-PDF-Vorlage für Angebote (Hero-Style)
export const getOfferPdfTemplate = (branding: PDFBranding = DEFAULT_BRANDING) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${branding.fontFamily};
      font-size: 9pt;
      line-height: 1.4;
      color: #333;
      background: white;
    }
    .page {
      padding: 15mm 20mm 20mm 20mm;
      min-height: 297mm;
      position: relative;
    }
    
    /* Header mit Logo und Firmeninfo */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid ${branding.primaryColor};
    }
    .logo-section {
      flex: 1;
    }
    .logo {
      max-width: 180px;
      max-height: 50px;
    }
    .logo-placeholder {
      font-size: 24pt;
      font-weight: bold;
      color: ${branding.primaryColor};
    }
    .company-info {
      text-align: right;
      font-size: 8pt;
      color: #555;
      line-height: 1.5;
    }
    .company-info strong {
      font-size: 10pt;
      color: #333;
    }
    
    /* Adress- und Dokumentinfo-Bereich */
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .address-block {
      flex: 1;
    }
    .sender-line {
      font-size: 7pt;
      color: #888;
      border-bottom: 1px solid #888;
      display: inline-block;
      margin-bottom: 8px;
      padding-bottom: 2px;
    }
    .recipient {
      font-size: 10pt;
      line-height: 1.6;
    }
    .recipient strong {
      font-size: 11pt;
    }
    .document-info {
      width: 220px;
      background: #f8f9fa;
      padding: 12px 15px;
      border-radius: 4px;
      border-left: 4px solid ${branding.primaryColor};
    }
    .document-info table {
      width: 100%;
      font-size: 9pt;
    }
    .document-info tr td {
      padding: 3px 0;
    }
    .document-info tr td:first-child {
      color: #666;
      width: 100px;
    }
    .document-info tr td:last-child {
      font-weight: 600;
      text-align: right;
    }
    
    /* Titel */
    .document-title {
      font-size: 16pt;
      font-weight: 700;
      color: ${branding.primaryColor};
      margin: 20px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    
    /* Einleitungstext */
    .intro-text {
      margin-bottom: 20px;
      font-size: 9pt;
      color: #444;
      white-space: pre-line;
      line-height: 1.6;
    }
    
    /* Positionen-Tabelle */
    .positions-section {
      margin-bottom: 15px;
    }
    .positions-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
    }
    .positions-table thead tr {
      background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%);
    }
    .positions-table th {
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .positions-table th.right { text-align: right; }
    .positions-table th.center { text-align: center; }
    .positions-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #e9ecef;
      vertical-align: top;
    }
    .positions-table tbody tr:hover {
      background-color: #f8f9fa;
    }
    .positions-table .pos-nr { width: 40px; font-weight: 600; color: ${branding.primaryColor}; }
    .positions-table .pos-qty { width: 45px; text-align: center; }
    .positions-table .pos-unit { width: 45px; text-align: center; }
    .positions-table .pos-price { width: 85px; text-align: right; }
    .positions-table .pos-total { width: 90px; text-align: right; font-weight: 600; }
    
    /* Positionsstile */
    .position-optional { background-color: #fff3e0 !important; }
    .position-optional td { color: #e65100; font-style: italic; }
    .position-alternative { background-color: #e3f2fd !important; }
    .position-alternative td { color: #1565c0; }
    .position-header { background-color: #f5f5f5 !important; }
    .position-header td { font-weight: 700; color: #333; font-size: 10pt; }
    
    .position-image {
      width: 50px;
      height: 50px;
      object-fit: contain;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-right: 10px;
      float: left;
    }
    .position-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
    }
    .position-details {
      font-size: 8pt;
      color: #666;
      margin-top: 4px;
      line-height: 1.4;
    }
    .position-badge {
      display: inline-block;
      font-size: 7pt;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
      margin-right: 5px;
    }
    .badge-optional { background: #fff3e0; color: #e65100; }
    .badge-alternative { background: #e3f2fd; color: #1565c0; }
    
    /* Summen-Block */
    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .summary-block {
      width: 280px;
    }
    .summary-block table {
      width: 100%;
      border-collapse: collapse;
    }
    .summary-block tr td {
      padding: 6px 10px;
      font-size: 9pt;
    }
    .summary-block tr td:first-child {
      text-align: right;
      color: #666;
    }
    .summary-block tr td:last-child {
      text-align: right;
      font-weight: 600;
      width: 100px;
    }
    .summary-block .subtotal {
      border-top: 1px solid #ddd;
    }
    .summary-block .total-row {
      background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%);
      color: white;
      font-size: 11pt;
    }
    .summary-block .total-row td {
      padding: 10px;
    }
    
    /* Zahlungsbedingungen */
    .payment-section {
      margin-top: 25px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid ${branding.secondaryColor};
    }
    .payment-section h4 {
      font-size: 10pt;
      color: ${branding.primaryColor};
      margin-bottom: 8px;
    }
    .payment-section p {
      font-size: 9pt;
      color: #555;
      white-space: pre-line;
      line-height: 1.5;
    }
    
    /* Fußtext */
    .footer-text {
      margin-top: 20px;
      font-size: 9pt;
      color: #555;
      white-space: pre-line;
      line-height: 1.5;
    }
    
    /* Unterschriften */
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-field {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #333;
      padding-top: 8px;
      margin-top: 40px;
      font-size: 8pt;
      color: #666;
    }
    
    /* Seiten-Footer */
    .page-footer {
      position: absolute;
      bottom: 10mm;
      left: 20mm;
      right: 20mm;
      text-align: center;
      font-size: 7pt;
      color: #888;
      border-top: 1px solid #eee;
      padding-top: 8px;
    }
    .page-footer .bank-info {
      margin-top: 3px;
    }
    
    /* Wasserzeichen für Entwürfe */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100pt;
      color: rgba(200, 200, 200, 0.2);
      font-weight: bold;
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
    }
    
    /* Druckoptimierung */
    @media print {
      .page { padding: 10mm 15mm 15mm 15mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    {{CONTENT}}
  </div>
</body>
</html>
`;

// Legacy-Support
export const OFFER_PDF_TEMPLATE = getOfferPdfTemplate();

class PDFService {
  private browser: Browser | null = null;

  // Browser-Instanz initialisieren (Singleton)
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
        // Für Railway/Docker-Umgebungen
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
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

  // Angebot als PDF generieren (Hero-Style)
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
      street?: string;
      postal_code?: string;
      city?: string;
      phone: string;
      email: string;
      website: string;
      tax_number: string;
      bank_name: string;
      iban: string;
      bic: string;
      logo_url?: string;
    };
    branding?: PDFBranding;
  }): Promise<Buffer> {
    const branding = offer.branding || DEFAULT_BRANDING;
    
    // Positionen-HTML generieren (Hero-Style)
    const positionsHtml = offer.items.map(item => {
      let rowClass = '';
      let badge = '';
      
      if (item.item_type === 'optional') {
        rowClass = 'position-optional';
        badge = '<span class="position-badge badge-optional">Bedarfsposition</span>';
      } else if (item.item_type === 'alternative') {
        rowClass = 'position-alternative';
        badge = '<span class="position-badge badge-alternative">Alternative</span>';
      } else if (item.item_type === 'header') {
        rowClass = 'position-header';
      }
      
      const isExcluded = item.item_type === 'optional' || item.item_type === 'alternative';
      
      return `
        <tr class="${rowClass}">
          <td class="pos-nr">${item.position.toString().padStart(3, '0')}</td>
          <td>
            ${item.image_url ? `<img src="${item.image_url}" class="position-image" alt="" />` : ''}
            <div class="position-title">${badge}${item.description}</div>
            ${item.long_description ? `<div class="position-details">${item.long_description}</div>` : ''}
          </td>
          <td class="pos-qty">${item.quantity}</td>
          <td class="pos-unit">${item.unit}</td>
          <td class="pos-price">${formatCurrency(item.unit_price)}</td>
          <td class="pos-total">${isExcluded ? `(${formatCurrency(item.total)})` : formatCurrency(item.total)}</td>
        </tr>
      `;
    }).join('');

    // Adresse formatieren
    const companyFullAddress = offer.company.street 
      ? `${offer.company.street}, ${offer.company.postal_code} ${offer.company.city}`
      : offer.company.address;

    const content = `
      ${offer.is_draft ? '<div class="watermark">ENTWURF</div>' : ''}
      
      <!-- Header mit Logo -->
      <div class="header">
        <div class="logo-section">
          ${offer.company.logo_url 
            ? `<img src="${offer.company.logo_url}" class="logo" alt="${offer.company.name}" />`
            : `<div class="logo-placeholder">${offer.company.name}</div>`
          }
        </div>
        <div class="company-info">
          <strong>${offer.company.name}</strong><br>
          ${companyFullAddress}<br>
          Tel: ${offer.company.phone}<br>
          E-Mail: ${offer.company.email}<br>
          ${offer.company.website}
        </div>
      </div>

      <!-- Adress- und Dokumentinfo -->
      <div class="info-section">
        <div class="address-block">
          <div class="sender-line">${offer.company.name} · ${companyFullAddress}</div>
          <div class="recipient">
            <strong>${offer.customer.name}</strong><br>
            ${offer.customer.address}<br>
            ${offer.customer.postal_code} ${offer.customer.city}
          </div>
        </div>
        
        <div class="document-info">
          <table>
            <tr><td>Angebot Nr.:</td><td>${offer.offer_number}</td></tr>
            <tr><td>Datum:</td><td>${offer.date}</td></tr>
            <tr><td>Gültig bis:</td><td>${offer.valid_until}</td></tr>
            ${offer.project ? `<tr><td>Projekt:</td><td>${offer.project.name}</td></tr>` : ''}
          </table>
        </div>
      </div>

      <!-- Titel -->
      <h1 class="document-title">Angebot ${offer.offer_number}</h1>

      <!-- Einleitungstext -->
      ${offer.intro_text ? `<div class="intro-text">${offer.intro_text}</div>` : ''}

      <!-- Positionen -->
      <div class="positions-section">
        <table class="positions-table">
          <thead>
            <tr>
              <th class="pos-nr">Pos.</th>
              <th>Bezeichnung</th>
              <th class="center">Menge</th>
              <th class="center">Einheit</th>
              <th class="right">Einzelpreis</th>
              <th class="right">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            ${positionsHtml}
          </tbody>
        </table>
      </div>

      <!-- Summen -->
      <div class="summary-section">
        <div class="summary-block">
          <table>
            <tr>
              <td>Nettobetrag:</td>
              <td>${formatCurrency(offer.total_net)}</td>
            </tr>
            <tr class="subtotal">
              <td>zzgl. ${offer.tax_rate}% MwSt.:</td>
              <td>${formatCurrency(offer.total_tax)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Gesamtbetrag:</strong></td>
              <td><strong>${formatCurrency(offer.total_gross)}</strong></td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Zahlungsbedingungen -->
      ${offer.payment_terms ? `
        <div class="payment-section">
          <h4>Zahlungsbedingungen</h4>
          <p>${offer.payment_terms}</p>
        </div>
      ` : ''}

      <!-- Fußtext -->
      ${offer.footer_text ? `
        <div class="footer-text">${offer.footer_text}</div>
      ` : ''}

      <!-- Unterschriften -->
      <div class="signature-section">
        <div class="signature-field">
          <div class="signature-line">Ort, Datum / Unterschrift Auftraggeber</div>
        </div>
        <div class="signature-field">
          <div class="signature-line">Unterschrift ${offer.company.name}</div>
        </div>
      </div>

      <!-- Seiten-Footer -->
      <div class="page-footer">
        ${offer.company.name} · ${companyFullAddress} · Steuernr.: ${offer.company.tax_number}
        <div class="bank-info">
          ${offer.company.bank_name} · IBAN: ${offer.company.iban} · BIC: ${offer.company.bic}
        </div>
      </div>
    `;

    const html = getOfferPdfTemplate(branding).replace('{{CONTENT}}', content);
    
    return this.generateFromHTML(html, {
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
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
