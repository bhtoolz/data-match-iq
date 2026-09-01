import { ValidationRow, ValidationStatus, ValidationSeverity, ColumnMapping, TargetField } from '@/types/data-match-iq';

export const AU_STREET_TYPES: Record<string, string> = {
  STREET: 'St',
  ST: 'St',
  ROAD: 'Rd',
  RD: 'Rd',
  AVENUE: 'Ave',
  AVE: 'Ave',
  PARADE: 'Pde',
  PDE: 'Pde',
  CIRCUIT: 'Cct',
  CCT: 'Cct',
  CRESCENT: 'Cres',
  CRES: 'Cres',
  HIGHWAY: 'Hwy',
  HWY: 'Hwy',
  DRIVE: 'Dr',
  DR: 'Dr',
  LANE: 'Ln',
  LN: 'Ln',
  PLACE: 'Pl',
  PL: 'Pl',
  TERRACE: 'Tce',
  TCE: 'Tce',
  BOULEVARD: 'Blvd',
  BLVD: 'Blvd',
  COURT: 'Ct',
  CT: 'Ct',
  CLOSE: 'Cl',
  CL: 'Cl',
  WAY: 'Way',
  GROVE: 'Gr',
  GR: 'Gr',
  ESPLANADE: 'Esp',
  ESP: 'Esp',
  PROMENADE: 'Prom',
  PROM: 'Prom',
  TRACK: 'Trk',
  TRK: 'Trk',
  WALK: 'Walk',
  ROW: 'Row',
  MEWS: 'Mews',
  RISE: 'Rise',
  CHASE: 'Chase',
  GLADE: 'Glade',
  LOOP: 'Loop',
  VISTA: 'Vista',
  PASS: 'Pass',
  RIDGE: 'Ridge',
  VALE: 'Vale',
};

export const AU_STATES: Record<string, string> = {
  NSW: 'NSW',
  'NEW SOUTH WALES': 'NSW',
  VIC: 'VIC',
  VICTORIA: 'VIC',
  QLD: 'QLD',
  QUEENSLAND: 'QLD',
  SA: 'SA',
  'SOUTH AUSTRALIA': 'SA',
  WA: 'WA',
  'WESTERN AUSTRALIA': 'WA',
  TAS: 'TAS',
  TASMANIA: 'TAS',
  ACT: 'ACT',
  'AUSTRALIAN CAPITAL TERRITORY': 'ACT',
  NT: 'NT',
  'NORTHERN TERRITORY': 'NT',
};

export const AU_POSTCODE_RANGES: Record<string, [number, number][]> = {
  NSW: [
    [1000, 1999],
    [2000, 2599],
    [2619, 2899],
    [2921, 2999],
  ],
  ACT: [
    [200, 299],
    [2600, 2618],
    [2900, 2920],
  ],
  VIC: [
    [3000, 3999],
    [8000, 8999],
  ],
  QLD: [
    [4000, 4999],
    [9000, 9999],
  ],
  SA: [
    [5000, 5799],
    [5800, 5999],
  ],
  WA: [
    [6000, 6797],
    [6800, 6999],
  ],
  TAS: [
    [7000, 7799],
    [7800, 7999],
  ],
  NT: [
    [800, 899],
    [900, 999],
  ],
};

export function toAustralianTitleCase(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (word.startsWith('mc') && word.length > 2) {
        return 'Mc' + word.charAt(2).toUpperCase() + word.slice(3);
      }
      if (word.startsWith("o'") && word.length > 2) {
        return "O'" + word.charAt(2).toUpperCase() + word.slice(3);
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function standardizeState(stateStr: string): string | null {
  if (!stateStr) return null;
  const clean = stateStr.trim().toUpperCase();
  if (AU_STATES[clean]) {
    return AU_STATES[clean];
  }
  return null;
}

export function validatePostcodeForState(postcodeStr: string, stateStr: string): boolean {
  const pc = parseInt(postcodeStr.replace(/\D/g, ''), 10);
  if (isNaN(pc)) return false;
  const state = standardizeState(stateStr);
  if (!state || !AU_POSTCODE_RANGES[state]) return false;

  const ranges = AU_POSTCODE_RANGES[state];
  return ranges.some(([min, max]) => pc >= min && pc <= max);
}

export function inferStateFromPostcode(postcodeStr: string): string | null {
  const pc = parseInt(postcodeStr.replace(/\D/g, ''), 10);
  if (isNaN(pc)) return null;

  for (const [state, ranges] of Object.entries(AU_POSTCODE_RANGES)) {
    if (ranges.some(([min, max]) => pc >= min && pc <= max)) {
      return state;
    }
  }
  return null;
}

export function parseUnitAndStreetNumber(rawStreet: string): {
  unit?: string;
  streetNumber?: string;
  streetNameRest: string;
} {
  let cleaned = rawStreet.trim();
  let unit: string | undefined;
  let streetNumber: string | undefined;

  // Check prefix patterns: "Unit 4/12", "U4/12", "Suite 3, 45", "Lot 10", "Shop 2/100"
  const prefixMatch = cleaned.match(/^(?:unit|u|suite|ste|shop|lot|flat|apt|apartment)\s*([a-zA-Z0-9\-_]+)[,\s/]+(\d+[a-zA-Z]?(?:-\d+[a-zA-Z]?)?)\s+(.*)$/i);
  if (prefixMatch) {
    return {
      unit: prefixMatch[1].toUpperCase(),
      streetNumber: prefixMatch[2],
      streetNameRest: prefixMatch[3],
    };
  }

  // Check "4/12 Main St" pattern
  const slashMatch = cleaned.match(/^([a-zA-Z0-9\-_]+)\/(\d+[a-zA-Z]?(?:-\d+[a-zA-Z]?)?)\s+(.*)$/);
  if (slashMatch) {
    return {
      unit: slashMatch[1].toUpperCase(),
      streetNumber: slashMatch[2],
      streetNameRest: slashMatch[3],
    };
  }

  // Check simple street number "12 Main St" or "24-26 Main St"
  const numMatch = cleaned.match(/^(\d+[a-zA-Z]?(?:-\d+[a-zA-Z]?)?)\s+(.*)$/);
  if (numMatch) {
    return {
      unit: undefined,
      streetNumber: numMatch[1],
      streetNameRest: numMatch[2],
    };
  }

  return {
    unit: undefined,
    streetNumber: undefined,
    streetNameRest: cleaned,
  };
}

export function standardizeStreetType(rawStreetName: string): {
  streetName: string;
  streetType?: string;
} {
  const parts = rawStreetName.trim().split(/\s+/);
  if (parts.length === 0) return { streetName: '' };
  if (parts.length === 1) return { streetName: toAustralianTitleCase(parts[0]) };

  const lastWord = parts[parts.length - 1].toUpperCase();
  if (AU_STREET_TYPES[lastWord]) {
    const stdType = AU_STREET_TYPES[lastWord];
    const nameOnly = parts.slice(0, -1).join(' ');
    return {
      streetName: toAustralianTitleCase(nameOnly),
      streetType: stdType,
    };
  }

  return {
    streetName: toAustralianTitleCase(rawStreetName),
  };
}

export function buildNormalisedAustralianAddress(components: {
  unit?: string;
  streetNumber?: string;
  streetName?: string;
  streetType?: string;
  suburb: string;
  state: string;
  postcode: string;
}): string {
  const streetParts: string[] = [];

  let streetLine = '';
  if (components.unit && components.streetNumber) {
    streetLine = `Unit ${components.unit}, ${components.streetNumber}`;
  } else if (components.streetNumber) {
    streetLine = components.streetNumber;
  } else if (components.unit) {
    streetLine = `Unit ${components.unit}`;
  }

  const nameAndType = [components.streetName, components.streetType].filter(Boolean).join(' ');
  if (nameAndType) {
    streetLine = streetLine ? `${streetLine} ${nameAndType}` : nameAndType;
  }

  if (streetLine) streetParts.push(streetLine);
  if (components.suburb) streetParts.push(toAustralianTitleCase(components.suburb));

  const statePostcode = [components.state.toUpperCase(), components.postcode].filter(Boolean).join(' ');
  if (statePostcode) streetParts.push(statePostcode);

  return streetParts.join(', ');
}

export function validateAndNormaliseRow(
  rawRow: Record<string, string>,
  rowIndex: number,
  mapping: ColumnMapping,
  allRowsSeenAddresses: Map<string, number>
): ValidationRow {
  // Extract fields based on mapping
  let externalId = '';
  let unit = '';
  let streetNumber = '';
  let streetName = '';
  let streetType = '';
  let suburb = '';
  let state = '';
  let postcode = '';
  let fullAddress = '';

  for (const [colName, target] of Object.entries(mapping)) {
    const val = (rawRow[colName] || '').trim();
    if (target === 'external_id') externalId = val;
    else if (target === 'unit_number') unit = val;
    else if (target === 'street_number') streetNumber = val;
    else if (target === 'street_name') streetName = val;
    else if (target === 'street_type') streetType = val;
    else if (target === 'suburb') suburb = val;
    else if (target === 'state') state = val;
    else if (target === 'postcode') postcode = val;
    else if (target === 'full_address') fullAddress = val;
  }

  // Fallback external ID if missing
  if (!externalId) {
    externalId = `REC-${rowIndex + 1}`;
  }

  // Construct raw original address string for display
  let rawAddressDisplay = '';
  if (fullAddress) {
    rawAddressDisplay = fullAddress;
  } else {
    const parts = [
      unit ? `Unit ${unit}` : '',
      streetNumber,
      streetName,
      streetType,
      suburb,
      state,
      postcode,
    ].filter(Boolean);
    rawAddressDisplay = parts.join(', ');
  }

  // If we have full address but un-split fields, try parsing full address
  if (fullAddress && (!streetName || !suburb)) {
    const parsedFromFull = parseFullAustralianAddressString(fullAddress);
    if (parsedFromFull) {
      if (!unit && parsedFromFull.unit) unit = parsedFromFull.unit;
      if (!streetNumber && parsedFromFull.streetNumber) streetNumber = parsedFromFull.streetNumber;
      if (!streetName && parsedFromFull.streetName) streetName = parsedFromFull.streetName;
      if (!streetType && parsedFromFull.streetType) streetType = parsedFromFull.streetType;
      if (!suburb && parsedFromFull.suburb) suburb = parsedFromFull.suburb;
      if (!state && parsedFromFull.state) state = parsedFromFull.state;
      if (!postcode && parsedFromFull.postcode) postcode = parsedFromFull.postcode;
    }
  }

  // If street contains unit/number together
  if (streetName && !streetNumber) {
    const parsedStreet = parseUnitAndStreetNumber(streetName);
    if (parsedStreet.unit && !unit) unit = parsedStreet.unit;
    if (parsedStreet.streetNumber) streetNumber = parsedStreet.streetNumber;
    if (parsedStreet.streetNameRest) streetName = parsedStreet.streetNameRest;
  }

  // Standardize street type if attached to streetName or separate
  if (streetType && AU_STREET_TYPES[streetType.toUpperCase()]) {
    streetType = AU_STREET_TYPES[streetType.toUpperCase()];
  } else if (streetName) {
    const std = standardizeStreetType(streetName);
    streetName = std.streetName;
    if (std.streetType && !streetType) streetType = std.streetType;
  }

  const stdState = standardizeState(state);
  const cleanPostcode = postcode.replace(/\D/g, '');

  // Validation Checks
  let status: ValidationStatus = 'ready';
  let severity: ValidationSeverity = 'ok';
  let issue = '—';
  let actionLabel: string | undefined;
  let suggestedCorrection: ValidationRow['suggestedCorrection'];

  // 1. Unparseable check
  if (!rawAddressDisplay || rawAddressDisplay === '-' || (!streetName && !suburb && !postcode)) {
    return {
      id: rowIndex + 1,
      sourceRow: rowIndex + 1,
      externalId,
      original: rawAddressDisplay || '(Empty record)',
      normalised: '-',
      status: 'unparseable',
      severity: 'invalid',
      issue: 'Cannot extract components',
      actionLabel: 'Exclude row',
      rawRecord: rawRow,
      parsedComponents: { unit, streetNumber, streetName, streetType, suburb, state, postcode },
    };
  }

  // 2. Unrecognised state check
  if (!stdState && state) {
    const inferred = inferStateFromPostcode(cleanPostcode);
    status = 'unrecognised_state';
    severity = 'invalid';
    issue = `State '${state}' not recognised`;
    actionLabel = inferred ? `Set to ${inferred}` : 'Correct state';
    if (inferred) {
      suggestedCorrection = {
        field: 'state',
        suggestedValue: inferred,
        reason: `Postcode ${cleanPostcode} belongs to ${inferred}`,
      };
    }
  } else if (!stdState && !state) {
    const inferred = inferStateFromPostcode(cleanPostcode);
    status = 'unrecognised_state';
    severity = 'invalid';
    issue = 'State missing';
    actionLabel = inferred ? `Set to ${inferred}` : 'Correct state';
    if (inferred) {
      suggestedCorrection = {
        field: 'state',
        suggestedValue: inferred,
        reason: `Inferred from postcode ${cleanPostcode}`,
      };
    }
  }
  // 3. Invalid Postcode for State check
  else if (stdState && cleanPostcode && !validatePostcodeForState(cleanPostcode, stdState)) {
    status = 'invalid_postcode';
    severity = 'invalid';
    issue = `Invalid postcode '${cleanPostcode}' for ${stdState}`;
    actionLabel = 'Correct postcode';
  }
  // 4. Missing postcode (warning / recoverable)
  else if (!cleanPostcode) {
    status = 'missing_info';
    severity = 'warning';
    issue = 'Postcode missing';
    actionLabel = 'Add postcode';
  }
  // 5. Incomplete missing components
  else if (!suburb || (!streetName && !streetNumber)) {
    status = 'incomplete';
    severity = 'warning';
    issue = !suburb ? 'Suburb missing' : 'Street details missing';
    actionLabel = 'Edit address';
  }

  // Format normalised address
  const finalState = stdState || state.toUpperCase();
  const normalisedAddress = buildNormalisedAustralianAddress({
    unit,
    streetNumber,
    streetName,
    streetType,
    suburb,
    state: finalState,
    postcode: cleanPostcode || postcode,
  });

  // 6. Duplicate check across the dataset
  const normKey = normalisedAddress.toLowerCase();
  if (status === 'ready' && allRowsSeenAddresses.has(normKey)) {
    const firstSeenRow = allRowsSeenAddresses.get(normKey)!;
    status = 'duplicate';
    severity = 'warning';
    issue = `Duplicate of row ${firstSeenRow}`;
    actionLabel = 'Review duplicate';
  } else if (status === 'ready' && normKey && normKey !== '-') {
    allRowsSeenAddresses.set(normKey, rowIndex + 1);
  }

  return {
    id: rowIndex + 1,
    sourceRow: rowIndex + 1,
    externalId,
    original: rawAddressDisplay,
    normalised: normalisedAddress,
    status,
    severity,
    issue,
    actionLabel: status === 'ready' ? undefined : actionLabel,
    suggestedCorrection,
    rawRecord: rawRow,
    parsedComponents: {
      unit,
      streetNumber,
      streetName,
      streetType,
      suburb,
      state: finalState,
      postcode: cleanPostcode || postcode,
    },
  };
}

export function parseFullAustralianAddressString(addressStr: string): {
  unit?: string;
  streetNumber?: string;
  streetName?: string;
  streetType?: string;
  suburb: string;
  state: string;
  postcode: string;
} | null {
  if (!addressStr || typeof addressStr !== 'string') return null;
  const clean = addressStr.trim();

  // Pattern: [Unit/Street line], [Suburb] [State] [Postcode]
  const statePostcodeMatch = clean.match(/(?:,\s*|\s+)(NSW|VIC|QLD|SA|WA|TAS|ACT|NT|New South Wales|Victoria|Queensland|South Australia|Western Australia|Tasmania)\s*(\d{4})?$/i);

  let state = '';
  let postcode = '';
  let rest = clean;

  if (statePostcodeMatch) {
    state = statePostcodeMatch[1];
    postcode = statePostcodeMatch[2] || '';
    rest = clean.slice(0, statePostcodeMatch.index).trim();
  }

  // Now parse suburb from rest
  const parts = rest.split(',').map((p) => p.trim()).filter(Boolean);
  let suburb = '';
  let streetPart = '';

  if (parts.length >= 2) {
    suburb = parts[parts.length - 1];
    streetPart = parts.slice(0, -1).join(', ');
  } else {
    streetPart = parts[0] || rest;
  }

  const { unit, streetNumber, streetNameRest } = parseUnitAndStreetNumber(streetPart);
  const { streetName, streetType } = standardizeStreetType(streetNameRest);

  return {
    unit,
    streetNumber,
    streetName,
    streetType,
    suburb,
    state,
    postcode,
  };
}
