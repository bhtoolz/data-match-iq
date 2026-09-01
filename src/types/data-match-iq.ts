export type TargetField =
  | 'external_id'
  | 'unit_number'
  | 'street_number'
  | 'street_name'
  | 'street_type'
  | 'suburb'
  | 'state'
  | 'postcode'
  | 'full_address'
  | 'source_name'
  | 'notes'
  | 'ignore';

export interface TargetFieldOption {
  value: TargetField;
  label: string;
  required?: boolean;
  description?: string;
}

export const TARGET_FIELDS: TargetFieldOption[] = [
  { value: 'external_id', label: 'External record ID', required: true, description: 'Unique identifier from source file' },
  { value: 'suburb', label: 'Suburb', required: true, description: 'Australian locality / suburb' },
  { value: 'state', label: 'State', required: true, description: 'Australian State (NSW, VIC, QLD, etc.)' },
  { value: 'postcode', label: 'Postcode', required: true, description: '4-digit Australian postcode' },
  { value: 'street_number', label: 'Street number', description: 'Street number or range (e.g. 12 or 24-26)' },
  { value: 'street_name', label: 'Street name', description: 'Street name without type (e.g. George, The Esplanade)' },
  { value: 'street_type', label: 'Street type', description: 'Street type (e.g. St, Rd, Pde, Ave)' },
  { value: 'unit_number', label: 'Unit number', description: 'Unit / flat / suite / shop number' },
  { value: 'full_address', label: 'Full address', description: 'Single un-split address column' },
  { value: 'source_name', label: 'Source name', description: 'Origin vendor or list name' },
  { value: 'notes', label: 'Notes', description: 'Additional campaign comments' },
  { value: 'ignore', label: 'Ignore (do not import)', description: 'Exclude this column from processing' },
];

export interface UploadedFileSummary {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  previewRows: Record<string, string>[];
  allRawRows: Record<string, string>[];
  uploadedAt: string;
}

export type ColumnMapping = Record<string, TargetField>;

export type ValidationSeverity = 'ok' | 'warning' | 'invalid' | 'neutral';

export type ValidationStatus =
  | 'ready'
  | 'missing_info'
  | 'incomplete'
  | 'duplicate'
  | 'invalid_postcode'
  | 'unrecognised_state'
  | 'unparseable'
  | 'excluded';

export interface SuggestedCorrection {
  field: 'postcode' | 'state' | 'suburb' | 'street' | 'unit';
  suggestedValue: string;
  reason: string;
}

export interface ValidationRow {
  id: number;
  sourceRow: number;
  externalId: string;
  original: string;
  normalised: string;
  status: ValidationStatus;
  severity: ValidationSeverity;
  issue: string;
  actionLabel?: string;
  suggestedCorrection?: SuggestedCorrection;
  rawRecord: Record<string, string>;
  parsedComponents: {
    unit?: string;
    streetNumber?: string;
    streetName?: string;
    streetType?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  isResolved?: boolean;
}

export interface AgentboxContact {
  contactId: string;
  name: string;
  address: string;
  unit?: string;
  streetNumber?: string;
  streetName?: string;
  streetType?: string;
  suburb: string;
  state: string;
  postcode: string;
  phone?: string;
  email?: string;
  assignedAgent?: string;
}

export type MatchStatus = 'Matched' | 'Review required' | 'No match' | 'Invalid';
export type ConfidenceLabel = 'High' | 'Likely' | 'Possible' | 'Low' | 'None';

export interface MatchScoreBreakdown {
  suburbMatch: boolean;
  stateMatch: boolean;
  postcodeMatch: boolean;
  streetNameSimilarity: number;
  streetNumberMatch: boolean;
  unitMatch: boolean | null;
}

export interface MatchResult {
  id: string;
  sourceRow: number;
  externalId: string;
  uploadedAddress: string;
  normalisedAddress: string;
  suggestedContact: AgentboxContact | null;
  status: MatchStatus;
  confidenceLabel: ConfidenceLabel;
  confidenceScore: number | null;
  confidenceReason: string;
  matchReason: string;
  breakdown?: MatchScoreBreakdown;
  originalRecord: Record<string, string>;
  reviewActionTaken?: 'approved' | 'rejected' | null;
}

export type WorkflowStage = 'upload' | 'map-fields' | 'validate' | 'match' | 'results';

export interface WorkflowState {
  stage: WorkflowStage;
  fileSummary: UploadedFileSummary | null;
  mappings: ColumnMapping;
  validationRows: ValidationRow[];
  matchResults: MatchResult[];
  activeJobId: string | null;
  isProcessing: boolean;
  processingProgress: number;
  processingStage: string;
  processingErrors: number;
}
