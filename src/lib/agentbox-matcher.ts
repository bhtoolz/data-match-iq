import { AgentboxContact, MatchResult, MatchStatus, ConfidenceLabel, ValidationRow } from '@/types/data-match-iq';

export const AGENTBOX_CONTACTS_DB: AgentboxContact[] = [
  {
    contactId: 'AGB-849201',
    name: 'Alexander Harrison',
    address: 'Unit 4, 12 The Esplanade, Surfers Paradise QLD 4217',
    unit: '4',
    streetNumber: '12',
    streetName: 'The Esplanade',
    streetType: 'Esp',
    suburb: 'Surfers Paradise',
    state: 'QLD',
    postcode: '4217',
    phone: '+61 412 890 123',
    email: 'a.harrison@horizonprop.com.au',
    assignedAgent: 'Lucas Vance (McGrath Surfers)',
  },
  {
    contactId: 'AGB-849202',
    name: 'Sarah & David Montgomery',
    address: '45 Campbell Pde, Bondi Beach NSW 2026',
    streetNumber: '45',
    streetName: 'Campbell',
    streetType: 'Pde',
    suburb: 'Bondi Beach',
    state: 'NSW',
    postcode: '2026',
    phone: '+61 422 111 890',
    email: 'dave.montgomery@outlook.com',
    assignedAgent: 'Craig Pontey (McGrath Double Bay)',
  },
  {
    contactId: 'AGB-849203',
    name: 'Eleanor Vance',
    address: 'Unit 12, 108 Ocean St, Clovelly NSW 2031',
    unit: '12',
    streetNumber: '108',
    streetName: 'Ocean',
    streetType: 'St',
    suburb: 'Clovelly',
    state: 'NSW',
    postcode: '2031',
    phone: '+61 403 992 481',
    email: 'eleanor.vance@gmail.com',
    assignedAgent: 'Mark McPherson (McGrath Coogee)',
  },
  {
    contactId: 'AGB-849204',
    name: 'Marcus & Chloe Sterling',
    address: '88 Wolseley Rd, Point Piper NSW 2027',
    streetNumber: '88',
    streetName: 'Wolseley',
    streetType: 'Rd',
    suburb: 'Point Piper',
    state: 'NSW',
    postcode: '2027',
    phone: '+61 418 700 910',
    email: 'marcus@sterlinginvestments.com.au',
    assignedAgent: 'Ben Collier (McGrath Paddington)',
  },
  {
    contactId: 'AGB-849205',
    name: 'Dr. Julian Thorne',
    address: 'Unit 2A, 15 Raglan St, Manly NSW 2095',
    unit: '2A',
    streetNumber: '15',
    streetName: 'Raglan',
    streetType: 'St',
    suburb: 'Manly',
    state: 'NSW',
    postcode: '2095',
    phone: '+61 411 345 678',
    email: 'dr.thorne@sydneyhealth.org',
    assignedAgent: 'Rowena Gill (McGrath Manly)',
  },
  {
    contactId: 'AGB-849206',
    name: 'Penelope Chen',
    address: '24-26 Crown St, Surry Hills NSW 2010',
    streetNumber: '24-26',
    streetName: 'Crown',
    streetType: 'St',
    suburb: 'Surry Hills',
    state: 'NSW',
    postcode: '2010',
    phone: '+61 405 678 123',
    email: 'penelope.chen@archdesign.com',
    assignedAgent: 'Michael Glynn (McGrath Surry Hills)',
  },
  {
    contactId: 'AGB-849207',
    name: 'Gavin & Fiona MacLeod',
    address: '14 Hopetoun Ave, Mosman NSW 2088',
    streetNumber: '14',
    streetName: 'Hopetoun',
    streetType: 'Ave',
    suburb: 'Mosman',
    state: 'NSW',
    postcode: '2088',
    phone: '+61 419 888 234',
    email: 'gmacleod@macleodcap.com',
    assignedAgent: 'Claudia Portale (McGrath Mosman)',
  },
  {
    contactId: 'AGB-849208',
    name: 'Liam & Olivia O’Connor',
    address: 'Unit 8, 34 Marine Pde, Cottesloe WA 6011',
    unit: '8',
    streetNumber: '34',
    streetName: 'Marine',
    streetType: 'Pde',
    suburb: 'Cottesloe',
    state: 'WA',
    postcode: '6011',
    phone: '+61 414 555 777',
    email: 'liam.oconnor@westmin.com.au',
    assignedAgent: 'Sam Bevan (McGrath WA)',
  },
  {
    contactId: 'AGB-849209',
    name: 'Robert & Teresa Kingsley',
    address: '52 Kooyong Rd, Toorak VIC 3142',
    streetNumber: '52',
    streetName: 'Kooyong',
    streetType: 'Rd',
    suburb: 'Toorak',
    state: 'VIC',
    postcode: '3142',
    phone: '+61 417 234 567',
    email: 'robert@kingsleyholdings.com.au',
    assignedAgent: 'Jeremy Fox (McGrath Toorak)',
  },
  {
    contactId: 'AGB-849210',
    name: 'Hannah & Matthew Wright',
    address: 'Unit 5, 22 Moray St, New Farm QLD 4005',
    unit: '5',
    streetNumber: '22',
    streetName: 'Moray',
    streetType: 'St',
    suburb: 'New Farm',
    state: 'QLD',
    postcode: '4005',
    phone: '+61 409 112 334',
    email: 'hannah.wright@brisbanelegal.com',
    assignedAgent: 'Brett Greensill (McGrath New Farm)',
  },
  {
    contactId: 'AGB-849211',
    name: 'Benjamin & Claire Kelly',
    address: '17 Glenmore Rd, Paddington NSW 2021',
    streetNumber: '17',
    streetName: 'Glenmore',
    streetType: 'Rd',
    suburb: 'Paddington',
    state: 'NSW',
    postcode: '2021',
    phone: '+61 413 889 001',
    email: 'bkelly@kellydesign.com.au',
    assignedAgent: 'Ben Collier (McGrath Paddington)',
  },
  {
    contactId: 'AGB-849212',
    name: 'Isobel Archer',
    address: 'Unit 3, 40 Church St, Brighton VIC 3186',
    unit: '3',
    streetNumber: '40',
    streetName: 'Church',
    streetType: 'St',
    suburb: 'Brighton',
    state: 'VIC',
    postcode: '3186',
    phone: '+61 412 334 556',
    email: 'isobel.archer@baysideart.com.au',
    assignedAgent: 'Kieran Molloy (McGrath Bayside)',
  },
  {
    contactId: 'AGB-849213',
    name: 'Nathaniel Drake',
    address: '102 George St, Parramatta NSW 2150',
    streetNumber: '102',
    streetName: 'George',
    streetType: 'St',
    suburb: 'Parramatta',
    state: 'NSW',
    postcode: '2150',
    phone: '+61 401 223 344',
    email: 'n.drake@westcorp.com.au',
    assignedAgent: 'Phillip Allison (McGrath Parramatta)',
  },
  {
    contactId: 'AGB-849214',
    name: 'Grace & Edward Holloway',
    address: '67 Victoria Ave, Albert Park VIC 3206',
    streetNumber: '67',
    streetName: 'Victoria',
    streetType: 'Ave',
    suburb: 'Albert Park',
    state: 'VIC',
    postcode: '3206',
    phone: '+61 415 667 889',
    email: 'holloway.edward@albertparklaw.com',
    assignedAgent: 'Simon Gowling (McGrath St Kilda)',
  },
  {
    contactId: 'AGB-849215',
    name: 'Harrison Boyd',
    address: 'Unit 14, 88 Kurraba Rd, Neutral Bay NSW 2089',
    unit: '14',
    streetNumber: '88',
    streetName: 'Kurraba',
    streetType: 'Rd',
    suburb: 'Neutral Bay',
    state: 'NSW',
    postcode: '2089',
    phone: '+61 423 998 776',
    email: 'harrison.boyd@sydneymedia.com.au',
    assignedAgent: 'Nigel Mukhi (McGrath Neutral Bay)',
  },
  {
    contactId: 'AGB-849216',
    name: 'Sophie & Daniel Lindqvist',
    address: '93 Hastings St, Noosa Heads QLD 4567',
    streetNumber: '93',
    streetName: 'Hastings',
    streetType: 'St',
    suburb: 'Noosa Heads',
    state: 'QLD',
    postcode: '4567',
    phone: '+61 416 333 222',
    email: 'sophie@noosaescapes.com',
    assignedAgent: 'Adrian Reed (McGrath Noosa)',
  },
  {
    contactId: 'AGB-849217',
    name: 'Arthur Pendelton',
    address: '5 The Crescent, Manly NSW 2095',
    streetNumber: '5',
    streetName: 'The Crescent',
    streetType: 'Cres',
    suburb: 'Manly',
    state: 'NSW',
    postcode: '2095',
    phone: '+61 418 445 566',
    email: 'arthur.p@pendelton.com.au',
    assignedAgent: 'Rowena Gill (McGrath Manly)',
  },
  {
    contactId: 'AGB-849218',
    name: 'Camilla & Tristan Foster',
    address: 'Unit 7, 19 Macleay St, Potts Point NSW 2011',
    unit: '7',
    streetNumber: '19',
    streetName: 'Macleay',
    streetType: 'St',
    suburb: 'Potts Point',
    state: 'NSW',
    postcode: '2011',
    phone: '+61 404 112 233',
    email: 'camilla.foster@curatordaily.com',
    assignedAgent: 'Jason Boon (McGrath Elizabeth Bay)',
  },
];

// String similarity using Levenshtein distance
function levenshteinSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;

  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();

  if (s1 === s2) return 1;

  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(null));

  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - distance / maxLen;
}

function cleanStreetName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]/g, '');
}

export function matchRowAgainstAgentbox(
  row: ValidationRow,
  customDb: AgentboxContact[] = AGENTBOX_CONTACTS_DB
): MatchResult {
  // If row is marked as invalid or unparseable, return Invalid with null score
  if (row.status === 'unparseable' || row.status === 'invalid_postcode' || row.status === 'unrecognised_state' || row.severity === 'invalid') {
    return {
      id: `RES-${row.id}`,
      sourceRow: row.sourceRow,
      externalId: row.externalId,
      uploadedAddress: row.original,
      normalisedAddress: row.normalised,
      suggestedContact: null,
      status: 'Invalid',
      confidenceLabel: 'None',
      confidenceScore: null,
      confidenceReason: row.issue || 'Record failed address validation checks',
      matchReason: `Record was excluded from matching due to validation error: ${row.issue}.`,
      originalRecord: row.rawRecord,
    };
  }

  // If excluded intentionally
  if (row.status === 'excluded') {
    return {
      id: `RES-${row.id}`,
      sourceRow: row.sourceRow,
      externalId: row.externalId,
      uploadedAddress: row.original,
      normalisedAddress: row.normalised,
      suggestedContact: null,
      status: 'Invalid',
      confidenceLabel: 'None',
      confidenceScore: null,
      confidenceReason: 'Excluded from matching',
      matchReason: 'Staff excluded this record from matching run.',
      originalRecord: row.rawRecord,
    };
  }

  const comp = row.parsedComponents;
  const targetSuburb = (comp.suburb || '').toLowerCase().trim();
  const targetState = (comp.state || '').toUpperCase().trim();
  const targetPostcode = (comp.postcode || '').trim();
  const targetStreetNum = (comp.streetNumber || '').toLowerCase().trim();
  const targetStreetName = cleanStreetName(comp.streetName || '');
  const targetUnit = (comp.unit || '').toLowerCase().trim();

  let bestContact: AgentboxContact | null = null;
  let bestScore = 0;
  let bestBreakdown = {
    suburbMatch: false,
    stateMatch: false,
    postcodeMatch: false,
    streetNameSimilarity: 0,
    streetNumberMatch: false,
    unitMatch: null as boolean | null,
  };
  let bestReason = '';
  let bestExplanation = '';

  for (const contact of customDb) {
    const cSuburb = (contact.suburb || '').toLowerCase().trim();
    const cState = (contact.state || '').toUpperCase().trim();
    const cPostcode = (contact.postcode || '').trim();
    const cStreetNum = (contact.streetNumber || '').toLowerCase().trim();
    const cStreetName = cleanStreetName(contact.streetName || '');
    const cUnit = (contact.unit || '').toLowerCase().trim();

    // Check locality match
    const suburbMatch = targetSuburb && cSuburb && (targetSuburb === cSuburb || targetSuburb.includes(cSuburb) || cSuburb.includes(targetSuburb));
    const stateMatch = targetState && cState && targetState === cState;
    const postcodeMatch = targetPostcode && cPostcode && targetPostcode === cPostcode;

    // Locality weighting
    let localityScore = 0;
    if (suburbMatch) localityScore += 0.25;
    if (postcodeMatch) localityScore += 0.15;
    if (stateMatch) localityScore += 0.05;

    // If locality has no overlap, skip contact
    if (localityScore < 0.25) continue;

    // Street name similarity
    const streetSim = levenshteinSimilarity(targetStreetName, cStreetName);
    const streetNumMatch = targetStreetNum && cStreetNum && (targetStreetNum === cStreetNum || targetStreetNum.includes(cStreetNum) || cStreetNum.includes(targetStreetNum));

    // Unit match
    let unitMatch: boolean | null = null;
    if (targetUnit && cUnit) {
      unitMatch = targetUnit === cUnit;
    } else if (!targetUnit && !cUnit) {
      unitMatch = true;
    } else {
      unitMatch = false; // One has unit, other doesn't
    }

    // Calculate overall percentage score
    let totalScore = 0;
    totalScore += localityScore * 100; // max 45
    totalScore += streetSim * 30; // max 30
    if (streetNumMatch) totalScore += 20; // max 20
    if (unitMatch === true) totalScore += 5; // max 5
    else if (unitMatch === false) totalScore -= 10; // penalty for unit mismatch

    totalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestContact = contact;
      bestBreakdown = {
        suburbMatch: !!suburbMatch,
        stateMatch: !!stateMatch,
        postcodeMatch: !!postcodeMatch,
        streetNameSimilarity: streetSim,
        streetNumberMatch: !!streetNumMatch,
        unitMatch,
      };

      // Formulate reasons
      if (bestScore >= 95) {
        if (targetUnit && cUnit) {
          bestReason = 'Exact unit and street match';
          bestExplanation = `Full exact match on Unit ${comp.unit}, ${comp.streetNumber} ${comp.streetName}, ${comp.suburb}. High confidence.`;
        } else {
          bestReason = 'Exact street number and suburb match';
          bestExplanation = `Complete address match on ${comp.streetNumber} ${comp.streetName}, ${comp.suburb} ${comp.state} ${comp.postcode}.`;
        }
      } else if (bestScore >= 80) {
        if (unitMatch === false && (cUnit || targetUnit)) {
          bestReason = 'Street match; unit variation in Agentbox';
          bestExplanation = `Street name and number match (${comp.streetNumber} ${comp.streetName}), but unit differs (Upload: '${targetUnit || 'none'}', Agentbox: '${cUnit || 'none'}').`;
        } else if (streetSim > 0.8 && streetSim < 1) {
          bestReason = 'Street type or spelling discrepancy';
          bestExplanation = `Suburb and number match; street name has minor variance ('${comp.streetName}' vs '${contact.streetName}').`;
        } else {
          bestReason = 'Likely match with minor variation';
          bestExplanation = `Strong correlation across suburb ${comp.suburb} and street details with slight formatting difference.`;
        }
      } else if (bestScore >= 60) {
        bestReason = 'Possible match in same suburb';
        bestExplanation = `Located in ${comp.suburb} ${comp.postcode}, but street number or unit requires human verification.`;
      } else {
        bestReason = 'Low confidence candidate';
        bestExplanation = `Partial locality overlap, but street name and number do not align confidently.`;
      }
    }
  }

  // Determine final status and confidence label
  let status: MatchStatus = 'No match';
  let confidenceLabel: ConfidenceLabel = 'None';

  if (!bestContact || bestScore < 60) {
    status = 'No match';
    confidenceLabel = 'Low';
    return {
      id: `RES-${row.id}`,
      sourceRow: row.sourceRow,
      externalId: row.externalId,
      uploadedAddress: row.original,
      normalisedAddress: row.normalised,
      suggestedContact: null,
      status: 'No match',
      confidenceLabel: 'Low',
      confidenceScore: bestScore > 0 ? Math.min(bestScore, 18) : null,
      confidenceReason: 'No contact found for address',
      matchReason: `Searched Agentbox contacts for ${comp.suburb || 'suburb'} ${comp.postcode || ''}; no matching property owner found.`,
      originalRecord: row.rawRecord,
    };
  }

  if (bestScore >= 95) {
    status = 'Matched';
    confidenceLabel = 'High';
  } else if (bestScore >= 80) {
    status = 'Review required';
    confidenceLabel = 'Likely';
  } else {
    status = 'Review required';
    confidenceLabel = 'Possible';
  }

  return {
    id: `RES-${row.id}`,
    sourceRow: row.sourceRow,
    externalId: row.externalId,
    uploadedAddress: row.original,
    normalisedAddress: row.normalised,
    suggestedContact: bestContact,
    status,
    confidenceLabel,
    confidenceScore: bestScore,
    confidenceReason: bestReason,
    matchReason: bestExplanation,
    breakdown: bestBreakdown,
    originalRecord: row.rawRecord,
  };
}
