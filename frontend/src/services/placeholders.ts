// Platzhalter-System wie in Hero Software
// Verwendung: {{Kategorie.Feld}}

export interface PlaceholderCategory {
  name: string;
  label: string;
  placeholders: Placeholder[];
}

export interface Placeholder {
  key: string;
  label: string;
  example: string;
}

export const PLACEHOLDER_CATEGORIES: PlaceholderCategory[] = [
  {
    name: 'Projekt',
    label: 'Projekt',
    placeholders: [
      { key: '{{Projekt.Name}}', label: 'Projektname', example: 'PV-Anlage Müller' },
      { key: '{{Projekt.Nummer}}', label: 'Projektnummer', example: 'P-2024-001' },
      { key: '{{Projekt.Adresse}}', label: 'Projektadresse', example: 'Musterstraße 1, 12345 Musterstadt' },
      { key: '{{Projekt.Status}}', label: 'Projektstatus', example: 'In Bearbeitung' },
      { key: '{{Projekt.Startdatum}}', label: 'Startdatum', example: '01.01.2025' },
      { key: '{{Projekt.Enddatum}}', label: 'Enddatum', example: '31.03.2025' },
    ],
  },
  {
    name: 'Kunde',
    label: 'Kunde',
    placeholders: [
      { key: '{{Kunde.Anrede}}', label: 'Anrede', example: 'Herr' },
      { key: '{{Kunde.Vorname}}', label: 'Vorname', example: 'Max' },
      { key: '{{Kunde.Nachname}}', label: 'Nachname', example: 'Mustermann' },
      { key: '{{Kunde.Name}}', label: 'Vollständiger Name', example: 'Max Mustermann' },
      { key: '{{Kunde.Firma}}', label: 'Firmenname', example: 'Musterfirma GmbH' },
      { key: '{{Kunde.Kundennummer}}', label: 'Kundennummer', example: 'K-2024-001' },
      { key: '{{Kunde.Email}}', label: 'E-Mail', example: 'max@example.com' },
      { key: '{{Kunde.Telefon}}', label: 'Telefon', example: '+49 123 456789' },
      { key: '{{Kunde.Adresse}}', label: 'Adresse', example: 'Kundenstraße 1, 12345 Kundenstadt' },
      { key: '{{Kunde.PLZ}}', label: 'Postleitzahl', example: '12345' },
      { key: '{{Kunde.Ort}}', label: 'Ort', example: 'Kundenstadt' },
    ],
  },
  {
    name: 'Dokument',
    label: 'Dokument',
    placeholders: [
      { key: '{{Dokument.Nummer}}', label: 'Dokumentnummer', example: 'ANG-2024-001' },
      { key: '{{Dokument.Datum}}', label: 'Dokumentdatum', example: '01.01.2025' },
      { key: '{{Dokument.Typ}}', label: 'Dokumenttyp', example: 'Angebot' },
      { key: '{{Dokument.Gueltig}}', label: 'Gültig bis', example: '21.01.2025' },
      { key: '{{Dokument.Netto}}', label: 'Nettobetrag', example: '10.000,00 €' },
      { key: '{{Dokument.MwSt}}', label: 'MwSt.-Betrag', example: '1.900,00 €' },
      { key: '{{Dokument.Brutto}}', label: 'Bruttobetrag', example: '11.900,00 €' },
    ],
  },
  {
    name: 'Firma',
    label: 'Eigene Firma',
    placeholders: [
      { key: '{{Firma.Name}}', label: 'Firmenname', example: 'Elite PV GmbH' },
      { key: '{{Firma.Adresse}}', label: 'Firmenadresse', example: 'Solarstraße 1, 12345 Solarstadt' },
      { key: '{{Firma.Telefon}}', label: 'Telefon', example: '+49 123 456789' },
      { key: '{{Firma.Email}}', label: 'E-Mail', example: 'info@elite-pv.de' },
      { key: '{{Firma.Website}}', label: 'Website', example: 'www.elite-pv.de' },
      { key: '{{Firma.Steuernummer}}', label: 'Steuernummer', example: '123/456/78901' },
      { key: '{{Firma.UStIdNr}}', label: 'USt-IdNr.', example: 'DE123456789' },
      { key: '{{Firma.Bankname}}', label: 'Bank', example: 'Sparkasse' },
      { key: '{{Firma.IBAN}}', label: 'IBAN', example: 'DE12 1234 5678 9012 3456 78' },
      { key: '{{Firma.BIC}}', label: 'BIC', example: 'ABCDEFGH' },
    ],
  },
  {
    name: 'Benutzer',
    label: 'Benutzer',
    placeholders: [
      { key: '{{Benutzer.Name}}', label: 'Benutzername', example: 'Max Mitarbeiter' },
      { key: '{{Benutzer.Email}}', label: 'E-Mail', example: 'max@elite-pv.de' },
      { key: '{{Benutzer.Telefon}}', label: 'Telefon', example: '+49 123 456789' },
      { key: '{{Benutzer.Position}}', label: 'Position', example: 'Vertriebsmitarbeiter' },
    ],
  },
  {
    name: 'Datum',
    label: 'Datum',
    placeholders: [
      { key: '{{Datum.Heute}}', label: 'Heutiges Datum', example: '01.01.2025' },
      { key: '{{Datum.Morgen}}', label: 'Morgen', example: '02.01.2025' },
      { key: '{{Datum.InEinerWoche}}', label: 'In einer Woche', example: '08.01.2025' },
      { key: '{{Datum.In3Wochen}}', label: 'In 3 Wochen', example: '22.01.2025' },
      { key: '{{Datum.Monatsende}}', label: 'Monatsende', example: '31.01.2025' },
      { key: '{{Datum.Jahr}}', label: 'Aktuelles Jahr', example: '2025' },
    ],
  },
];

// Ersetzt Platzhalter in einem Text
export function replacePlaceholders(
  text: string,
  data: {
    project?: any;
    customer?: any;
    document?: any;
    company?: any;
    user?: any;
  }
): string {
  let result = text;

  // Projekt-Platzhalter
  if (data.project) {
    result = result.replace(/\{\{Projekt\.Name\}\}/g, data.project.name || '');
    result = result.replace(/\{\{Projekt\.Nummer\}\}/g, data.project.reference || '');
    result = result.replace(/\{\{Projekt\.Adresse\}\}/g, data.project.address || '');
    result = result.replace(/\{\{Projekt\.Status\}\}/g, data.project.status || '');
    result = result.replace(/\{\{Projekt\.Startdatum\}\}/g, formatDate(data.project.start_date));
    result = result.replace(/\{\{Projekt\.Enddatum\}\}/g, formatDate(data.project.end_date));
  }

  // Kunde-Platzhalter
  if (data.customer) {
    result = result.replace(/\{\{Kunde\.Anrede\}\}/g, data.customer.salutation || '');
    result = result.replace(/\{\{Kunde\.Vorname\}\}/g, data.customer.first_name || '');
    result = result.replace(/\{\{Kunde\.Nachname\}\}/g, data.customer.last_name || '');
    result = result.replace(/\{\{Kunde\.Name\}\}/g, `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim());
    result = result.replace(/\{\{Kunde\.Firma\}\}/g, data.customer.company_name || '');
    result = result.replace(/\{\{Kunde\.Kundennummer\}\}/g, data.customer.customer_number || '');
    result = result.replace(/\{\{Kunde\.Email\}\}/g, data.customer.email || '');
    result = result.replace(/\{\{Kunde\.Telefon\}\}/g, data.customer.phone || '');
    result = result.replace(/\{\{Kunde\.Adresse\}\}/g, data.customer.address || '');
    result = result.replace(/\{\{Kunde\.PLZ\}\}/g, data.customer.postal_code || '');
    result = result.replace(/\{\{Kunde\.Ort\}\}/g, data.customer.city || '');
  }

  // Dokument-Platzhalter
  if (data.document) {
    result = result.replace(/\{\{Dokument\.Nummer\}\}/g, data.document.document_number || data.document.offer_number || '');
    result = result.replace(/\{\{Dokument\.Datum\}\}/g, formatDate(data.document.created_at || data.document.date));
    result = result.replace(/\{\{Dokument\.Typ\}\}/g, data.document.type || 'Angebot');
    result = result.replace(/\{\{Dokument\.Gueltig\}\}/g, formatDate(data.document.valid_until));
    result = result.replace(/\{\{Dokument\.Netto\}\}/g, formatCurrency(data.document.total_net || data.document.total_amount));
    result = result.replace(/\{\{Dokument\.MwSt\}\}/g, formatCurrency(data.document.total_tax));
    result = result.replace(/\{\{Dokument\.Brutto\}\}/g, formatCurrency(data.document.total_gross || data.document.total_amount * 1.19));
  }

  // Firma-Platzhalter (Standardwerte)
  result = result.replace(/\{\{Firma\.Name\}\}/g, data.company?.name || 'Elite PV GmbH');
  result = result.replace(/\{\{Firma\.Adresse\}\}/g, data.company?.address || '');
  result = result.replace(/\{\{Firma\.Telefon\}\}/g, data.company?.phone || '');
  result = result.replace(/\{\{Firma\.Email\}\}/g, data.company?.email || '');
  result = result.replace(/\{\{Firma\.Website\}\}/g, data.company?.website || '');
  result = result.replace(/\{\{Firma\.Steuernummer\}\}/g, data.company?.tax_number || '');
  result = result.replace(/\{\{Firma\.UStIdNr\}\}/g, data.company?.vat_id || '');
  result = result.replace(/\{\{Firma\.Bankname\}\}/g, data.company?.bank_name || '');
  result = result.replace(/\{\{Firma\.IBAN\}\}/g, data.company?.iban || '');
  result = result.replace(/\{\{Firma\.BIC\}\}/g, data.company?.bic || '');

  // Benutzer-Platzhalter
  if (data.user) {
    result = result.replace(/\{\{Benutzer\.Name\}\}/g, `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim());
    result = result.replace(/\{\{Benutzer\.Email\}\}/g, data.user.email || '');
    result = result.replace(/\{\{Benutzer\.Telefon\}\}/g, data.user.phone || '');
    result = result.replace(/\{\{Benutzer\.Position\}\}/g, data.user.position || '');
  }

  // Datum-Platzhalter
  const today = new Date();
  result = result.replace(/\{\{Datum\.Heute\}\}/g, formatDate(today));
  result = result.replace(/\{\{Datum\.Morgen\}\}/g, formatDate(addDays(today, 1)));
  result = result.replace(/\{\{Datum\.InEinerWoche\}\}/g, formatDate(addDays(today, 7)));
  result = result.replace(/\{\{Datum\.In3Wochen\}\}/g, formatDate(addDays(today, 21)));
  result = result.replace(/\{\{Datum\.Monatsende\}\}/g, formatDate(getEndOfMonth(today)));
  result = result.replace(/\{\{Datum\.Jahr\}\}/g, today.getFullYear().toString());

  return result;
}

// Hilfsfunktionen
function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-DE');
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// Extrahiert alle Platzhalter aus einem Text
export function extractPlaceholders(text: string): string[] {
  const regex = /\{\{[^}]+\}\}/g;
  return text.match(regex) || [];
}

// Prüft, ob alle Platzhalter ersetzt wurden
export function hasUnreplacedPlaceholders(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}





