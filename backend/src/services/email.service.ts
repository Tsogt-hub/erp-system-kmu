// E-Mail-Service für Dokumentenversand
// Unterstützt SMTP und verschiedene E-Mail-Provider

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  fromName?: string;
}

// Standard E-Mail-Vorlagen
export const EMAIL_TEMPLATES = {
  OFFER: {
    subject: 'Ihr Angebot {{Dokument.Nummer}} von {{Firma.Name}}',
    html: `
<p>Sehr geehrte(r) {{Kunde.Anrede}} {{Kunde.Nachname}},</p>

<p>anbei erhalten Sie unser Angebot {{Dokument.Nummer}} vom {{Dokument.Datum}}.</p>

<p><strong>Zusammenfassung:</strong><br>
Nettobetrag: {{Dokument.Netto}}<br>
Bruttobetrag: {{Dokument.Brutto}}</p>

<p>Das Angebot ist gültig bis {{Dokument.Gueltig}}.</p>

<p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>

<p>Mit freundlichen Grüßen<br>
{{Benutzer.Name}}<br>
{{Firma.Name}}</p>
    `,
  },
  INVOICE: {
    subject: 'Ihre Rechnung {{Dokument.Nummer}} von {{Firma.Name}}',
    html: `
<p>Sehr geehrte(r) {{Kunde.Anrede}} {{Kunde.Nachname}},</p>

<p>anbei erhalten Sie unsere Rechnung {{Dokument.Nummer}} vom {{Dokument.Datum}}.</p>

<p><strong>Rechnungsbetrag:</strong> {{Dokument.Brutto}}</p>

<p>Bitte überweisen Sie den Betrag innerhalb von 14 Tagen auf das unten angegebene Konto.</p>

<p><strong>Bankverbindung:</strong><br>
{{Firma.Bankname}}<br>
IBAN: {{Firma.IBAN}}<br>
BIC: {{Firma.BIC}}</p>

<p>Mit freundlichen Grüßen<br>
{{Benutzer.Name}}<br>
{{Firma.Name}}</p>
    `,
  },
  ORDER_CONFIRMATION: {
    subject: 'Ihre Auftragsbestätigung {{Dokument.Nummer}} von {{Firma.Name}}',
    html: `
<p>Sehr geehrte(r) {{Kunde.Anrede}} {{Kunde.Nachname}},</p>

<p>vielen Dank für Ihren Auftrag!</p>

<p>Anbei erhalten Sie unsere Auftragsbestätigung {{Dokument.Nummer}} vom {{Dokument.Datum}}.</p>

<p>Wir werden uns zeitnah mit Ihnen in Verbindung setzen, um den weiteren Ablauf zu besprechen.</p>

<p>Mit freundlichen Grüßen<br>
{{Benutzer.Name}}<br>
{{Firma.Name}}</p>
    `,
  },
  REMINDER: {
    subject: 'Zahlungserinnerung - Rechnung {{Dokument.Nummer}}',
    html: `
<p>Sehr geehrte(r) {{Kunde.Anrede}} {{Kunde.Nachname}},</p>

<p>wir möchten Sie freundlich daran erinnern, dass die Rechnung {{Dokument.Nummer}} vom {{Dokument.Datum}} noch offen ist.</p>

<p><strong>Offener Betrag:</strong> {{Dokument.Brutto}}</p>

<p>Bitte überweisen Sie den Betrag zeitnah auf das unten angegebene Konto.</p>

<p>Falls Sie bereits gezahlt haben, betrachten Sie dieses Schreiben als gegenstandslos.</p>

<p>Mit freundlichen Grüßen<br>
{{Benutzer.Name}}<br>
{{Firma.Name}}</p>
    `,
  },
};

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  // Konfiguration setzen
  configure(config: EmailConfig): void {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }

  // E-Mail senden
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter || !this.config) {
      return { success: false, error: 'E-Mail-Service nicht konfiguriert' };
    }

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.config.fromName 
          ? `"${this.config.fromName}" <${this.config.from}>`
          : this.config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
      };

      if (options.cc) {
        mailOptions.cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
      }

      if (options.bcc) {
        mailOptions.bcc = Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc;
      }

      if (options.attachments && options.attachments.length > 0) {
        mailOptions.attachments = options.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          path: att.path,
          contentType: att.contentType,
        }));
      }

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('E-Mail gesendet', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId,
      });

      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      logger.error('E-Mail-Versand fehlgeschlagen', {
        to: options.to,
        subject: options.subject,
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  }

  // Verbindung testen
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Dokument per E-Mail senden
  async sendDocument(
    documentType: keyof typeof EMAIL_TEMPLATES,
    to: string,
    pdfBuffer: Buffer,
    documentNumber: string,
    placeholderData: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = EMAIL_TEMPLATES[documentType];
    if (!template) {
      return { success: false, error: 'Unbekannter Dokumenttyp' };
    }

    // Platzhalter ersetzen
    let subject = template.subject;
    let html = template.html;

    for (const [key, value] of Object.entries(placeholderData)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      subject = subject.replace(regex, value || '');
      html = html.replace(regex, value || '');
    }

    return this.send({
      to,
      subject,
      html,
      attachments: [
        {
          filename: `${documentNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}

export const emailService = new EmailService();





