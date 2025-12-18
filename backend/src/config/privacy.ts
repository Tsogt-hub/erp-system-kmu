export interface DataRetentionPolicy {
  domain: string;
  retentionDays: number;
  legalBasis: string;
}

export interface ConsentPolicy {
  code: string;
  description: string;
  requiredFor: string[];
}

export const retentionPolicies: DataRetentionPolicy[] = [
  { domain: 'projects', retentionDays: 1825, legalBasis: 'GoBD / HGB' },
  { domain: 'time_entries', retentionDays: 365, legalBasis: 'Arbeitsrecht' },
];

export const consentPolicies: ConsentPolicy[] = [
  {
    code: 'customer_marketing',
    description: 'Nutzung von Kundendaten für Marketing-Kommunikation',
    requiredFor: ['crm', 'campaigns'],
  },
];


