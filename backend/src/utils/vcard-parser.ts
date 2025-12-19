// vCard Parser für Kontakt-Import
// Unterstützt vCard 3.0 und 4.0

export interface ParsedVCard {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  company_name?: string;
  position?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  website?: string;
  birthday?: string;
  notes?: string;
}

export function parseVCard(vcardString: string): ParsedVCard {
  const result: ParsedVCard = {};
  const lines = vcardString.split(/\r?\n/);
  
  let currentField = '';
  let currentValue = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle folded lines (continuation)
    if (line.startsWith(' ') || line.startsWith('\t')) {
      currentValue += line.substring(1);
      continue;
    }
    
    // Process previous field
    if (currentField) {
      processField(result, currentField, currentValue);
    }
    
    // Parse new field
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      currentField = line.substring(0, colonIndex).toUpperCase();
      currentValue = line.substring(colonIndex + 1);
    } else {
      currentField = '';
      currentValue = '';
    }
  }
  
  // Process last field
  if (currentField) {
    processField(result, currentField, currentValue);
  }
  
  return result;
}

function processField(result: ParsedVCard, field: string, value: string): void {
  // Remove type parameters for comparison
  const fieldBase = field.split(';')[0];
  const fieldParams = field.split(';').slice(1).map(p => p.toUpperCase());
  
  // Decode value
  value = decodeVCardValue(value);
  
  switch (fieldBase) {
    case 'N':
      // N:Nachname;Vorname;Weitere Vornamen;Prefix;Suffix
      const nameParts = value.split(';');
      result.last_name = nameParts[0] || '';
      result.first_name = nameParts[1] || '';
      break;
      
    case 'FN':
      result.full_name = value;
      break;
      
    case 'ORG':
      result.company_name = value.split(';')[0];
      break;
      
    case 'TITLE':
      result.position = value;
      break;
      
    case 'EMAIL':
      result.email = value;
      break;
      
    case 'TEL':
      if (fieldParams.includes('CELL') || fieldParams.includes('TYPE=CELL')) {
        result.mobile = value;
      } else if (fieldParams.includes('FAX') || fieldParams.includes('TYPE=FAX')) {
        result.fax = value;
      } else {
        result.phone = value;
      }
      break;
      
    case 'ADR':
      // ADR:;;Straße;Stadt;Region;PLZ;Land
      const adrParts = value.split(';');
      result.address = adrParts[2] || '';
      result.city = adrParts[3] || '';
      result.postal_code = adrParts[5] || '';
      result.country = adrParts[6] || '';
      break;
      
    case 'URL':
      result.website = value;
      break;
      
    case 'BDAY':
      result.birthday = value;
      break;
      
    case 'NOTE':
      result.notes = value;
      break;
  }
}

function decodeVCardValue(value: string): string {
  // Decode quoted-printable
  if (value.includes('=')) {
    value = value.replace(/=([0-9A-F]{2})/gi, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }
  
  // Decode escaped characters
  value = value.replace(/\\n/g, '\n');
  value = value.replace(/\\,/g, ',');
  value = value.replace(/\\;/g, ';');
  value = value.replace(/\\\\/g, '\\');
  
  return value.trim();
}

// Generiert eine vCard aus Kontaktdaten
export function generateVCard(contact: {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  position?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  website?: string;
  birthday?: string;
  notes?: string;
}): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];
  
  // Name
  if (contact.first_name || contact.last_name) {
    lines.push(`N:${contact.last_name || ''};${contact.first_name || ''};;;`);
    lines.push(`FN:${contact.first_name || ''} ${contact.last_name || ''}`.trim());
  }
  
  // Organization
  if (contact.company_name) {
    lines.push(`ORG:${escapeVCardValue(contact.company_name)}`);
  }
  
  // Title
  if (contact.position) {
    lines.push(`TITLE:${escapeVCardValue(contact.position)}`);
  }
  
  // Email
  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${contact.email}`);
  }
  
  // Phone
  if (contact.phone) {
    lines.push(`TEL;TYPE=WORK:${contact.phone}`);
  }
  
  // Mobile
  if (contact.mobile) {
    lines.push(`TEL;TYPE=CELL:${contact.mobile}`);
  }
  
  // Fax
  if (contact.fax) {
    lines.push(`TEL;TYPE=FAX:${contact.fax}`);
  }
  
  // Address
  if (contact.address || contact.city || contact.postal_code || contact.country) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(contact.address || '')};${escapeVCardValue(contact.city || '')};;${contact.postal_code || ''};${escapeVCardValue(contact.country || '')}`);
  }
  
  // Website
  if (contact.website) {
    lines.push(`URL:${contact.website}`);
  }
  
  // Birthday
  if (contact.birthday) {
    lines.push(`BDAY:${contact.birthday}`);
  }
  
  // Notes
  if (contact.notes) {
    lines.push(`NOTE:${escapeVCardValue(contact.notes)}`);
  }
  
  lines.push('END:VCARD');
  
  return lines.join('\r\n');
}

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Validiert eine vCard-Datei
export function isValidVCard(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith('BEGIN:VCARD') && trimmed.endsWith('END:VCARD');
}






