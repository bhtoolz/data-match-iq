import { ECardCode, ECardDefinition, InstructorRecord } from '@/types/cpr';

export const ECARD_CATALOG: Record<ECardCode, ECardDefinition> = {
  BLS: {
    code: 'BLS',
    title: 'Basic Life Support (BLS)',
    category: 'Healthcare',
    description: 'AHA certification card for healthcare providers, EMTs, nurses, and hospital staff.',
    unitPrice: 22.0,
  },
  'HSFA CPR AED': {
    code: 'HSFA CPR AED',
    title: 'Heartsaver First Aid CPR AED',
    category: 'Heartsaver',
    description: 'Comprehensive adult, child, and infant CPR AED and first aid certification.',
    unitPrice: 24.0,
  },
  'HS CPR AED': {
    code: 'HS CPR AED',
    title: 'Heartsaver CPR AED',
    category: 'Heartsaver',
    description: 'CPR and automated external defibrillator certification for general public & workplace.',
    unitPrice: 21.0,
  },
  HSFA: {
    code: 'HSFA',
    title: 'Heartsaver First Aid',
    category: 'Heartsaver',
    description: 'First aid basics, medical emergencies, injury emergencies, and environmental emergencies.',
    unitPrice: 20.0,
  },
  'HS Pediatric FA CPR AED': {
    code: 'HS Pediatric FA CPR AED',
    title: 'Heartsaver Pediatric First Aid CPR AED',
    category: 'Specialty',
    description: 'Designed specifically for childcare providers, educators, and daycare personnel.',
    unitPrice: 25.0,
  },
  'HS K-12': {
    code: 'HS K-12',
    title: 'Heartsaver First Aid CPR AED K-12',
    category: 'Specialty',
    description: 'Tailored for middle and high school students, faculty, and school sports coaches.',
    unitPrice: 18.0,
  },
  BBP: {
    code: 'BBP',
    title: 'Bloodborne Pathogens (BBP)',
    category: 'Specialty',
    description: 'OSHA compliant course for employees with potential exposure to bloodborne pathogens.',
    unitPrice: 19.0,
  },
};

export const DEFAULT_INSTRUCTORS: InstructorRecord[] = [
  {
    name: 'Aaron McDonald',
    status: 'Active',
    authorizedCards: {
      BLS: true,
      'HSFA CPR AED': true,
      'HS CPR AED': true,
      HSFA: true,
      'HS Pediatric FA CPR AED': false,
      'HS K-12': true,
      BBP: false,
    },
  },
  {
    name: 'Alicia Moore',
    status: 'Active',
    authorizedCards: {
      BLS: true,
      'HSFA CPR AED': false,
      'HS CPR AED': false,
      HSFA: false,
      'HS Pediatric FA CPR AED': false,
      'HS K-12': false,
      BBP: false,
    },
  },
  {
    name: 'Marcus Vance',
    status: 'Active',
    authorizedCards: {
      BLS: true,
      'HSFA CPR AED': true,
      'HS CPR AED': true,
      HSFA: true,
      'HS Pediatric FA CPR AED': true,
      'HS K-12': true,
      BBP: true,
    },
  },
  {
    name: 'David Miller',
    status: 'Inactive',
    authorizedCards: {
      BLS: true,
      'HSFA CPR AED': false,
      'HS CPR AED': false,
      HSFA: false,
      'HS Pediatric FA CPR AED': false,
      'HS K-12': false,
      BBP: false,
    },
  },
];

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function findInstructorLocally(
  queryName: string,
  records: InstructorRecord[] = DEFAULT_INSTRUCTORS
): InstructorRecord | null {
  const cleanQuery = normalizeName(queryName);
  if (!cleanQuery) return null;

  return (
    records.find((rec) => normalizeName(rec.name) === cleanQuery) ||
    records.find((rec) => normalizeName(rec.name).includes(cleanQuery)) ||
    null
  );
}

/**
 * Parse standard CSV export from Google Sheets or Excel
 */
export function parseInstructorCsv(csvText: string): InstructorRecord[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  // Header line
  // Example: Instructor Name,STATUS,BLS,HSFA CPR AED,HS CPR AED,HSFA,HS Pediatric FA CPR AED,HS K-12,BBP
  const records: InstructorRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parser handling commas inside quotes
    const row = splitCsvRow(lines[i]);
    if (row.length < 2) continue;

    const name = row[0]?.trim();
    const status = row[1]?.trim();
    if (!name) continue;

    const isCardChecked = (val?: string) => {
      if (!val) return false;
      const v = val.trim().toLowerCase();
      return (
        v === 'true' ||
        v === '1' ||
        v === 'yes' ||
        v === 'checked' ||
        v === '✓' ||
        v === '✔' ||
        v === 'x'
      );
    };

    records.push({
      name,
      status: status || 'Inactive',
      authorizedCards: {
        BLS: isCardChecked(row[2]),
        'HSFA CPR AED': isCardChecked(row[3]),
        'HS CPR AED': isCardChecked(row[4]),
        HSFA: isCardChecked(row[5]),
        'HS Pediatric FA CPR AED': isCardChecked(row[6]),
        'HS K-12': isCardChecked(row[7]),
        BBP: isCardChecked(row[8]),
      },
    });
  }

  return records;
}

function splitCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
