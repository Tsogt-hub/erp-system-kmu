// Elite PV GmbH - Firmenkonfiguration aus Hero Software übernommen
// Stand: Dezember 2024

export const ELITE_PV_COMPANY = {
  name: 'Elite PV GmbH',
  street: 'Lindenhof 4b',
  postal_code: '92670',
  city: 'Windischeschenbach',
  phone: '09681 9184308',
  mobile: '01511 5323657',
  email: 'info@elite-pv.de',
  website: 'http://www.elite-pv.de',
  
  // Rechtliche Daten
  legal_form: 'GmbH',
  founding_date: '2023-08-23',
  tax_number: '255/125/51087',
  vat_id: 'DE362598317',
  commercial_register: 'HRB 6141',
  
  // Bankverbindung
  bank_name: 'Volksbank Raiffeisenbank Nordoberpfalz',
  iban: 'DE54753900000000771287',
  bic: 'GENODEF1WEV',
  
  // Absenderzeile für Dokumente (wie in Hero konfiguriert)
  sender_line: 'Elite PV GmbH, Lindenhof 4B, 92670 Windischeschenbach',
};

export const ELITE_PV_OFFER_TEXTS = {
  // Standard-Einleitungstext für PV-Angebote
  intro_text: `Sehr geehrte Damen und Herren,

vielen Dank für Ihr Interesse an einer Photovoltaikanlage. Gerne unterbreiten wir Ihnen folgendes Angebot:`,

  // Standard-Fußtext für PV-Angebote (aus Hero übernommen)
  footer_text: `Das Angebot hat eine Gültigkeit von 4 Wochen ab Empfang.

Als Zahlungsbedingungen werden vereinbart:
50% der Auftragssumme bei Auftragserteilung
50% der Auftragssumme bei Fertigstellung vor Inbetriebnahme durch den Netzbetreiber

Bemerkungen:
Hiermit bestelle(n) ich / wir, die oben beschriebenen Produkte und Dienstleistungen. Mit Unterzeichnung dieses Angebotes durch den Kunden wird ein wirksamer Kaufvertrag mit der Elite PV GmbH geschlossen.

• Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.
• Stromzähler wird/werden vom jeweiligen Netzbetreiber gestellt. Es besteht keine Haftung der Elite PV für Verzögerungen bei der Terminvergabe für die Zählermontage durch den Netzbetreiber.
• Nach Unterzeichnung des Angebots wird die Elektronische Umsetzbarkeit noch final durch den Elektromeister überprüft, sollten Mehrkosten entstehen kann beidseitig ohne Kosten vom Kaufvertrag zurückgetreten werden.
• Eine etwaige Wirtschaftlichkeitsberechnung, angenommene / errechnete PV-Erträge und ein Autarkiegrad sind lediglich theoretisch errechnete Werte und können von den tatsächlich erreichten Werten abweichen. Hierfür übernimmt Elite PV keine Haftung.
• Bei außerordentlichen Extraarbeiten welche nicht im Angebot vermerkt sind, behält es sich Elite PV vor diese in Rechnung zu stellen.
• Es ist Elite PV gestattet Foto- und Videomaterial aufzunehmen und dies zu verwenden. Sollte dies nicht gewünscht sein, ist dies in der Bemerkung zu vermerken.
• Bei Nichterfüllung dieses Kaufvertrages durch den Kunden beträgt der Schadensersatz pauschal 20% vom Netto Kaufbetrag (ohne Mehrwertsteuer). Die Geltendmachung eines höheren Schadens durch Elite PV bleibt vorbehalten.
• Etwaige weitere Vereinbarungen und Nebenreden existieren nicht und bedürfen in jedem Fall der Schriftform.
• Garantie Bestimmungen und Projektbericht sind mit Unterschrift akzeptiert.
• Der Auftraggeber bestätigt mit seiner Unterschrift ein Exemplar des Vertrages erhalten zu haben.

☐ Ja, ich bin mit den Datenschutzrichtlinien einverstanden, die unter https://www.elite-pv.de/datenschutz/ eingesehen werden können.

Ort, Datum / Unterschrift Kunde ______________________

Unterschrift Vertrieb Elite PV GmbH ___________________`,

  // Schlusstext für Rechnungen
  invoice_footer: `Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Rechnungsnummer im Verwendungszweck auf das unten angegebene Konto.

Für das entgegengebrachte Vertrauen und die angenehme Zusammenarbeit möchten wir uns bedanken.
Wir freuen uns auf die weitere Zusammenarbeit mit Ihnen.

Mit freundlichen Grüßen
Elite PV GmbH`,

  // Grußformel
  greeting: 'Mit sonnigen Grüßen ☀️',
};

// Gewerke / Leistungsbereiche von Elite PV
export const ELITE_PV_SERVICES = [
  'Photovoltaik',
  'Photovoltaik Commercial',
  'Photovoltaik Residential',
  'Photovoltaik mit Speicher und Notstromsystem',
  'Photovoltaik mit Speicher, Wallbox und Wärmepumpe',
  'AC-Montage',
  'Elektroinstallation',
  'Wärmepumpe',
  'Stahlbau',
];

// Zahlungsbedingungen für verschiedene Dokumenttypen
export const ELITE_PV_PAYMENT_TERMS = {
  standard: '14 Tage netto',
  pv_anlage: '50% bei Auftragserteilung, 50% bei Fertigstellung',
  freifläche: '50% Vorauskasse, 20% Lieferung UK, 10% Lieferung WR, 15% Betriebsbereitschaft, 5% nach 3 Monaten',
  waermepumpe: '50% bei Auftragserteilung, 50% bei Fertigstellung vor Inbetriebnahme',
};
