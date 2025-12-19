/**
 * Hero Software - Artikel Import
 * Importiert alle Artikel aus Hero Software in unser ERP-System
 */

import { query } from '../config/database';

// Artikeldaten aus Hero Software (Stand: 27.11.2025)
export const HERO_ARTICLES = [
  // PV Module
  {
    sku: '2008',
    name: 'SolarEdge Optimierer S500B-1GM4MRM 550 Watt',
    description: 'Eigenschaften der S500B Optimierer: - MPPT-Betriebsbereich 12,5 - 105 V - Max. Eingangsstrom 11A - Max. Ausgangsstrom 15A - Max. Wirkungsgrad 99,5% - Gewicht 1,4 kg - IP68 Schutzklasse',
    category: 'Optimierer',
    unit: 'Stk',
    purchase_price: 57.00,
    sales_price: 74.10,
    margin_percent: 30,
    manufacturer: 'SolarEdge',
    image_url: 'https://www.solaredge.com/sites/default/files/s500b-optimizer.png'
  },
  {
    sku: '428115',
    name: 'BYD LVS 4.0 kWh PV-Speicher',
    description: 'BYD Battery-Box Premium LVS 4.0 - 48 V Batterie. Die neue Systemgeneration mit verbesserter Zellchemie und höherer Lebensdauer. Modular erweiterbar bis 256 kWh.',
    category: 'Speicher',
    unit: 'Stk',
    purchase_price: 1234.00,
    sales_price: 1604.20,
    margin_percent: 30,
    manufacturer: 'BYD',
    image_url: 'https://www.byd.com/content/dam/byd-site/eu/battery-box/lvs-4-0.png'
  },
  {
    sku: '428111',
    name: 'Hardy Barth Wallbox 11 kW cPµ2 Pro inkl. Montage',
    description: 'Hardy Barth entwickelt und produziert spezielle Lösungen für den E-Mobility Bereich. Die cPµ2 Pro Wallbox bietet 11 kW Ladeleistung, RFID-Authentifizierung und integriertes Lastmanagement.',
    category: 'Wallbox',
    unit: 'Stk',
    purchase_price: 1215.44,
    sales_price: 1620.07,
    margin_percent: 33,
    manufacturer: 'Hardy Barth',
    image_url: 'https://www.hardy-barth.de/images/wallbox-cpu2-pro.jpg'
  },
  {
    sku: '2049',
    name: 'Longi Hochleistungsmodul LR7-54HVBB-475W',
    description: 'Modellbezeichnung: L-54HVBB-475M. Das Unternehmen Longi zählt zu den weltweit führenden Herstellern von monokristallinen Silizium-Wafern und Solarmodulen. Höchste Effizienz mit Hi-MO 7 Technologie.',
    category: 'Modul',
    unit: 'Stk',
    purchase_price: 65.55,
    sales_price: 98.25,
    margin_percent: 50,
    manufacturer: 'Longi',
    image_url: 'https://www.longi.com/content/dam/longi/products/hi-mo-7.png'
  },
  {
    sku: '428114',
    name: 'Cenming Flexibles Modul 520W',
    description: '- flexibles Modul - geringere Zelltemperatur bei Verschattung - hocheffizient - ideal für Dächer mit geringer Traglast - biegbar bis 30°',
    category: 'Modul',
    unit: 'Stk',
    purchase_price: 106.20,
    sales_price: 143.37,
    margin_percent: 35,
    manufacturer: 'Cenming',
    image_url: 'https://www.cenming-solar.com/images/flexible-module-520w.jpg'
  },
  {
    sku: '428113',
    name: 'Umverdrahtung',
    description: 'Professionelle Umverdrahtung bestehender PV-Anlagen. Inklusive Materialkosten und Arbeitszeit.',
    category: 'Dienstleistung',
    unit: 'Stk',
    purchase_price: 450.00,
    sales_price: 585.00,
    margin_percent: 30,
    manufacturer: '',
    image_url: ''
  },
  {
    sku: '428112',
    name: 'Longi Hochleistungsmodul Hi-Mo X10 Guardian Anti-Dust 650W',
    description: 'Modellbezeichnung: LR7-72HVHF 640~670M - Zelltechnologie: Ausgestattet mit HPBC (Hybrid Passivated Back Contact) Zellen. Anti-Dust Beschichtung für verbesserte Selbstreinigung.',
    category: 'Modul',
    unit: 'Stk',
    purchase_price: 70.00,
    sales_price: 98.00,
    margin_percent: 40,
    manufacturer: 'Longi',
    image_url: 'https://www.longi.com/content/dam/longi/products/hi-mo-x10.png'
  },
  {
    sku: '2024',
    name: 'Longi Hochleistungsmodul Hi-Mo X10 Guardian Anti-Dust 650W (Variante)',
    description: 'Modellbezeichnung: LR7-72HVDF 640~665M - Zelltechnologie: Ausgestattet mit HPBC Zellen. Doppelglas-Ausführung für erhöhte Langlebigkeit.',
    category: 'Modul',
    unit: 'Stk',
    purchase_price: 70.00,
    sales_price: 104.78,
    margin_percent: 50,
    manufacturer: 'Longi',
    image_url: 'https://www.longi.com/content/dam/longi/products/hi-mo-x10-df.png'
  },
  {
    sku: '428110',
    name: 'Hager KU83CHE BKE-AZ 3-phasig',
    description: 'Hager Zählerschrank mit integriertem Überspannungsschutz. 3-phasige Ausführung für PV-Anlagen bis 30 kWp.',
    category: 'Zählerschrank',
    unit: 'Stk',
    purchase_price: 0.00,
    sales_price: 180.00,
    margin_percent: 100,
    manufacturer: 'Hager',
    image_url: 'https://www.hager.de/images/ku83che.jpg'
  },
  {
    sku: '428109',
    name: 'Solarfabrik Mono S4 Halfcut',
    description: 'Deutsche Garantie - 30 Jahre Garantie auf das Produkt und 30 Jahre auf die Leistung. Hocheffiziente Halfcut-Zellen für maximalen Ertrag.',
    category: 'Modul',
    unit: 'Stk',
    purchase_price: 60.00,
    sales_price: 78.00,
    margin_percent: 30,
    manufacturer: 'Solarfabrik',
    image_url: 'https://www.solarfabrik.de/images/mono-s4.jpg'
  },
  {
    sku: '428108',
    name: 'TP-Link TL-PA7019P KIT AV1000',
    description: 'Powerline-Adapter für die Netzwerkverbindung von PV-Wechselrichtern. Bis zu 1000 Mbit/s Übertragungsrate.',
    category: 'Netzwerk',
    unit: 'Stk',
    purchase_price: 39.49,
    sales_price: 51.34,
    margin_percent: 30,
    manufacturer: 'TP-Link',
    image_url: 'https://www.tp-link.com/images/tl-pa7019p.png'
  },
  {
    sku: '2004',
    name: 'Trapez DC-Montage pro Modul',
    description: '- Montage der Module bis zum Speicher mit integrierten bzw. externen Optimierern - DC-Verkabelung - Modulbefestigung auf Trapezblech',
    category: 'Montage',
    unit: 'Stk',
    purchase_price: 48.50,
    sales_price: 58.50,
    margin_percent: 21,
    manufacturer: '',
    image_url: ''
  },
  {
    sku: '1567',
    name: 'Thermodach Montage Mehrkosten pro Haken/Blechziegel/AlphaPlatte',
    description: '- Spezialkonstruktion für die Montage auf Thermodächern. Zusätzliche Befestigungselemente für erhöhte Stabilität.',
    category: 'Montage',
    unit: 'Stk',
    purchase_price: 55.00,
    sales_price: 59.50,
    margin_percent: 8,
    manufacturer: '',
    image_url: ''
  },
  {
    sku: '428107',
    name: 'Dachziegelversiegelung Nanoprotect',
    description: 'Wie funktioniert sie? Die Nanoversiegelung arbeitet nach dem Prinzip der Lotus-Blatt-Effekt. Wasser perlt ab und nimmt Schmutzpartikel mit.',
    category: 'Zubehör',
    unit: 'm²',
    purchase_price: 18.00,
    sales_price: 23.40,
    margin_percent: 30,
    manufacturer: 'Nanoprotect',
    image_url: ''
  },
  {
    sku: '1311',
    name: 'Trafo sowie Übergabestation (ÜSS)',
    description: '- Übergabestation sowie Trafostationen abgestimmt auf die Gesamtleistung der PV-Anlage. Für Großanlagen ab 500 kWp.',
    category: 'Infrastruktur',
    unit: 'pauschal',
    purchase_price: 860000.00,
    sales_price: 1118000.00,
    margin_percent: 30,
    manufacturer: '',
    image_url: ''
  },
  {
    sku: '428064',
    name: 'Abdeckbahn Trapezblech',
    description: '- Wasserabweisung – Zusatzschutz unter Trapezblech. Verhindert Kondensation und schützt die Unterkonstruktion.',
    category: 'Zubehör',
    unit: 'm²',
    purchase_price: 15.00,
    sales_price: 19.50,
    margin_percent: 30,
    manufacturer: '',
    image_url: ''
  },
  {
    sku: '1951',
    name: 'SolarEdge ONE Controller HOME',
    description: '- Erfüllt alle Anforderungen des §14a EnWG - Zusätzliche Rechenleistung mit KI-basierter Optimierung - Smart Home Integration',
    category: 'Controller',
    unit: 'Stk',
    purchase_price: 369.00,
    sales_price: 381.95,
    margin_percent: 3.5,
    manufacturer: 'SolarEdge',
    image_url: 'https://www.solaredge.com/images/one-controller.png'
  },
  {
    sku: '428008',
    name: 'Fronius Notstrom - Backup Controller 3PN-35A inkl. Installation',
    description: 'Produktinformationen Fronius Backup Controller. Der Fronius Backup Controller ermöglicht die Notstromversorgung bei Netzausfall. 3-phasig, 35A.',
    category: 'Notstrom',
    unit: 'Stk',
    purchase_price: 669.00,
    sales_price: 769.35,
    margin_percent: 15,
    manufacturer: 'Fronius',
    image_url: 'https://www.fronius.com/images/backup-controller.jpg'
  },
  {
    sku: '428106',
    name: 'FRITZ! Repeater 600 International',
    description: 'WLAN Typ: 802.11b. Datenübertragungsrate: 600 Megabit pro Sekunde. Ideal für die WLAN-Erweiterung bei PV-Monitoring.',
    category: 'Netzwerk',
    unit: 'Stk',
    purchase_price: 33.90,
    sales_price: 44.07,
    margin_percent: 30,
    manufacturer: 'AVM',
    image_url: 'https://www.avm.de/images/fritz-repeater-600.png'
  },
  {
    sku: '428105',
    name: 'Versetzen der Anlage pro Modul',
    description: 'Demontage und Neumontage eines PV-Moduls. Inklusive Verkabelung und Prüfung.',
    category: 'Dienstleistung',
    unit: 'Stk',
    purchase_price: 60.00,
    sales_price: 78.00,
    margin_percent: 30,
    manufacturer: '',
    image_url: ''
  },
  {
    sku: '1045',
    name: 'Hardy Barth Wallbox 11 kW inkl. Montage und Einbau TSG',
    description: '- Hardy Barth cPH2 1T11 8m Ladekabel, RFID - Typ 2 Ladekabel 8 m - RFID-Modul für Zugangskontrolle - Inklusive Montage und Einbau',
    category: 'Wallbox',
    unit: 'Stk',
    purchase_price: 1475.56,
    sales_price: 1918.23,
    margin_percent: 30,
    manufacturer: 'Hardy Barth',
    image_url: 'https://www.hardy-barth.de/images/wallbox-cph2.jpg'
  },
  {
    sku: '1358',
    name: 'SolarEdge 8kW Hybrid Wechselrichter SE8K-RWB48',
    description: 'SolarEdge Premium Hybrid-Wechselrichter: SolarEdge Wechselrichter haben keinen String-Ausfall durch Schatten. Optimierte Leistung pro Modul.',
    category: 'Wechselrichter',
    unit: 'Stk',
    purchase_price: 901.04,
    sales_price: 1481.46,
    margin_percent: 64,
    manufacturer: 'SolarEdge',
    image_url: 'https://www.solaredge.com/images/se8k-rwb48.png'
  },
  // Weitere wichtige PV-Artikel
  {
    sku: '1001',
    name: 'Fronius Symo GEN24 10.0 Plus',
    description: 'Hybrid-Wechselrichter mit integriertem Notstrom. 10 kW Nennleistung, 2 MPP-Tracker, WiFi & LAN integriert.',
    category: 'Wechselrichter',
    unit: 'Stk',
    purchase_price: 2100.00,
    sales_price: 2730.00,
    margin_percent: 30,
    manufacturer: 'Fronius',
    image_url: 'https://www.fronius.com/images/symo-gen24.jpg'
  },
  {
    sku: '1002',
    name: 'Huawei SUN2000-10KTL-M1',
    description: 'String-Wechselrichter 10 kW. Hoher Wirkungsgrad von 98,6%. Integrierter Smart Dongle für Monitoring.',
    category: 'Wechselrichter',
    unit: 'Stk',
    purchase_price: 1450.00,
    sales_price: 1885.00,
    margin_percent: 30,
    manufacturer: 'Huawei',
    image_url: 'https://www.huawei.com/images/sun2000-10ktl.png'
  },
  {
    sku: '1003',
    name: 'SMA Sunny Tripower 10.0',
    description: 'Dreiphasiger PV-Wechselrichter mit SMA Smart Connected für proaktives Monitoring. 10 kW Nennleistung.',
    category: 'Wechselrichter',
    unit: 'Stk',
    purchase_price: 1680.00,
    sales_price: 2184.00,
    margin_percent: 30,
    manufacturer: 'SMA',
    image_url: 'https://www.sma.de/images/sunny-tripower-10.jpg'
  },
  {
    sku: '1004',
    name: 'K2 Systems CrossRail 4.0 Set',
    description: 'Montagesystem für Schrägdächer. Aluminium-Schienen mit Modulklemmen für rahmenlosen und gerahmte Module.',
    category: 'Montagesystem',
    unit: 'Set',
    purchase_price: 85.00,
    sales_price: 110.50,
    margin_percent: 30,
    manufacturer: 'K2 Systems',
    image_url: 'https://www.k2-systems.com/images/crossrail.jpg'
  },
  {
    sku: '1005',
    name: 'Schletter Rapid2+ Montagesystem',
    description: 'Schnellmontagesystem für Aufdach-Installationen. Vormontierte Komponenten für schnelle Installation.',
    category: 'Montagesystem',
    unit: 'Set',
    purchase_price: 95.00,
    sales_price: 123.50,
    margin_percent: 30,
    manufacturer: 'Schletter',
    image_url: 'https://www.schletter-group.com/images/rapid2plus.jpg'
  },
  {
    sku: '1006',
    name: 'BYD Battery-Box HVS 10.2',
    description: 'Hochvolt-Speichersystem 10,2 kWh. Modular erweiterbar bis 40,8 kWh. Kompatibel mit allen gängigen Wechselrichtern.',
    category: 'Speicher',
    unit: 'Stk',
    purchase_price: 4200.00,
    sales_price: 5460.00,
    margin_percent: 30,
    manufacturer: 'BYD',
    image_url: 'https://www.byd.com/images/battery-box-hvs.png'
  },
  {
    sku: '1007',
    name: 'SENEC.Home V3 hybrid duo 10.0',
    description: 'Hybrid-Speichersystem mit 10 kWh Kapazität. Integrierter Wechselrichter und Cloud-Anbindung.',
    category: 'Speicher',
    unit: 'Stk',
    purchase_price: 8500.00,
    sales_price: 11050.00,
    margin_percent: 30,
    manufacturer: 'SENEC',
    image_url: 'https://www.senec.com/images/home-v3-hybrid.jpg'
  },
  {
    sku: '1008',
    name: 'Enphase IQ8+ Mikrowechselrichter',
    description: 'Modulwechselrichter mit 300W AC-Ausgangsleistung. Sunlight Backup fähig ohne zusätzliche Batterie.',
    category: 'Mikrowechselrichter',
    unit: 'Stk',
    purchase_price: 185.00,
    sales_price: 240.50,
    margin_percent: 30,
    manufacturer: 'Enphase',
    image_url: 'https://www.enphase.com/images/iq8plus.png'
  },
  {
    sku: '1009',
    name: 'JA Solar JAM72S30-545/MR',
    description: 'Hochleistungs-Solarmodul 545W. Monokristalline PERC-Zellen, Bifazial-Option verfügbar.',
    category: 'Modul',
    unit: 'Stk',
    purchase_price: 95.00,
    sales_price: 123.50,
    margin_percent: 30,
    manufacturer: 'JA Solar',
    image_url: 'https://www.jasolar.com/images/jam72s30.jpg'
  },
  {
    sku: '1010',
    name: 'Trina Solar Vertex S+ TSM-440NEG9R.28',
    description: 'N-Type Modul mit 440W Leistung. 21,8% Modulwirkungsgrad, 30 Jahre Leistungsgarantie.',
    category: 'Modul',
    unit: 'Stk',
    purchase_price: 110.00,
    sales_price: 143.00,
    margin_percent: 30,
    manufacturer: 'Trina Solar',
    image_url: 'https://www.trinasolar.com/images/vertex-s-plus.jpg'
  },
  {
    sku: '1011',
    name: 'Canadian Solar HiKu6 CS6R-420MS',
    description: 'Monokristallines Modul 420W. Half-Cell Technologie für bessere Schattentoleranz.',
    category: 'Modul',
    unit: 'Stk',
    purchase_price: 88.00,
    sales_price: 114.40,
    margin_percent: 30,
    manufacturer: 'Canadian Solar',
    image_url: 'https://www.canadiansolar.com/images/hiku6.jpg'
  },
  {
    sku: '1012',
    name: 'Weidmüller PV-Anschlusskasten GAK',
    description: 'Generatoranschlusskasten für PV-Anlagen. Mit integriertem Überspannungsschutz Typ 2.',
    category: 'Zubehör',
    unit: 'Stk',
    purchase_price: 320.00,
    sales_price: 416.00,
    margin_percent: 30,
    manufacturer: 'Weidmüller',
    image_url: 'https://www.weidmueller.com/images/gak.jpg'
  },
  {
    sku: '1013',
    name: 'Phoenix Contact SOL-SC-1ST-0-DC-2MPPT-1001',
    description: 'String-Combiner für 2 MPPT. DC-Schutzschalter und Überspannungsableiter integriert.',
    category: 'Zubehör',
    unit: 'Stk',
    purchase_price: 450.00,
    sales_price: 585.00,
    margin_percent: 30,
    manufacturer: 'Phoenix Contact',
    image_url: 'https://www.phoenixcontact.com/images/sol-sc.jpg'
  },
  {
    sku: '1014',
    name: 'Stäubli MC4 Stecker Set',
    description: 'Original MC4 Steckverbinder Set. 1 Paar (männlich + weiblich) für 4-6mm² Kabel.',
    category: 'Zubehör',
    unit: 'Set',
    purchase_price: 3.50,
    sales_price: 4.55,
    margin_percent: 30,
    manufacturer: 'Stäubli',
    image_url: 'https://www.staubli.com/images/mc4.jpg'
  },
  {
    sku: '1015',
    name: 'Solar-Kabel 6mm² schwarz (100m)',
    description: 'PV-Solarkabel H1Z2Z2-K 6mm². UV-beständig, halogenfrei, Temperaturbereich -40°C bis +90°C.',
    category: 'Kabel',
    unit: 'Rolle',
    purchase_price: 145.00,
    sales_price: 188.50,
    margin_percent: 30,
    manufacturer: 'Lapp',
    image_url: 'https://www.lappkabel.de/images/solar-kabel.jpg'
  },
  {
    sku: '1016',
    name: 'Dachhaken Biberschwanz Universal',
    description: 'Verstellbarer Dachhaken für Biberschwanz-Ziegel. Edelstahl A2, inkl. Befestigungsmaterial.',
    category: 'Montagesystem',
    unit: 'Stk',
    purchase_price: 8.50,
    sales_price: 11.05,
    margin_percent: 30,
    manufacturer: 'K2 Systems',
    image_url: 'https://www.k2-systems.com/images/dachhaken-biber.jpg'
  },
  {
    sku: '1017',
    name: 'Dachhaken Frankfurter Pfanne',
    description: 'Dachhaken für Frankfurter Pfanne. Edelstahl A2, höhenverstellbar.',
    category: 'Montagesystem',
    unit: 'Stk',
    purchase_price: 7.80,
    sales_price: 10.14,
    margin_percent: 30,
    manufacturer: 'Schletter',
    image_url: 'https://www.schletter-group.com/images/dachhaken-frankfurter.jpg'
  },
  {
    sku: '1018',
    name: 'Modulklemme Mittelklemme 30-40mm',
    description: 'Aluminium-Mittelklemme für Module mit 30-40mm Rahmen. Inkl. Hammerkopfschraube.',
    category: 'Montagesystem',
    unit: 'Stk',
    purchase_price: 1.80,
    sales_price: 2.34,
    margin_percent: 30,
    manufacturer: 'K2 Systems',
    image_url: 'https://www.k2-systems.com/images/mittelklemme.jpg'
  },
  {
    sku: '1019',
    name: 'Modulklemme Endklemme 30-40mm',
    description: 'Aluminium-Endklemme für Module mit 30-40mm Rahmen. Inkl. Hammerkopfschraube.',
    category: 'Montagesystem',
    unit: 'Stk',
    purchase_price: 1.60,
    sales_price: 2.08,
    margin_percent: 30,
    manufacturer: 'K2 Systems',
    image_url: 'https://www.k2-systems.com/images/endklemme.jpg'
  },
  {
    sku: '1020',
    name: 'Erdungsklemme für PV-Module',
    description: 'Erdungsklemme zur Potentialausgleich von PV-Modulrahmen. Edelstahl.',
    category: 'Zubehör',
    unit: 'Stk',
    purchase_price: 2.20,
    sales_price: 2.86,
    margin_percent: 30,
    manufacturer: 'Weidmüller',
    image_url: 'https://www.weidmueller.com/images/erdungsklemme.jpg'
  }
];

/**
 * Importiert alle Hero-Artikel in die Datenbank
 */
export async function importHeroArticles(): Promise<void> {
  console.log('🔄 Starte Import von Hero-Artikeln...');
  
  let imported = 0;
  let skipped = 0;
  
  for (const article of HERO_ARTICLES) {
    try {
      // Prüfen ob Artikel bereits existiert
      const existing = await query(
        'SELECT id FROM items WHERE sku = $1',
        [article.sku]
      );
      
      if (existing.rows && existing.rows.length > 0) {
        console.log(`⏭️  Artikel ${article.sku} existiert bereits`);
        skipped++;
        continue;
      }
      
      // Artikel einfügen
      await query(
        `INSERT INTO items (
          sku, name, description, category, unit,
          purchase_price, sales_price, margin_percent,
          manufacturer, image_url, stock_quantity, min_stock,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, datetime('now'), datetime('now'))`,
        [
          article.sku,
          article.name,
          article.description,
          article.category,
          article.unit,
          article.purchase_price,
          article.sales_price,
          article.margin_percent,
          article.manufacturer,
          article.image_url,
          0, // stock_quantity
          5  // min_stock
        ]
      );
      
      console.log(`✅ Artikel ${article.sku} importiert: ${article.name}`);
      imported++;
    } catch (error) {
      console.error(`❌ Fehler beim Import von ${article.sku}:`, error);
    }
  }
  
  console.log(`\n📊 Import abgeschlossen:`);
  console.log(`   ✅ Importiert: ${imported}`);
  console.log(`   ⏭️  Übersprungen: ${skipped}`);
  console.log(`   📦 Gesamt: ${HERO_ARTICLES.length}`);
}

// Kategorien für die Artikel
export const HERO_CATEGORIES = [
  'Modul',
  'Wechselrichter',
  'Mikrowechselrichter',
  'Speicher',
  'Wallbox',
  'Optimierer',
  'Controller',
  'Notstrom',
  'Montagesystem',
  'Zubehör',
  'Kabel',
  'Netzwerk',
  'Zählerschrank',
  'Infrastruktur',
  'Dienstleistung'
];







