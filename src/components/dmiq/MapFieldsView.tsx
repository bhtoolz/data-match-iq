'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  AlertCircle,
} from 'lucide-react';
import {
  UploadedFileSummary,
  ColumnMapping,
  TargetField,
  TARGET_FIELDS,
} from '@/types/data-match-iq';
import { buildNormalisedAustralianAddress } from '@/lib/australian-address-normalizer';

interface MapFieldsViewProps {
  fileSummary: UploadedFileSummary;
  initialMapping: ColumnMapping;
  onConfirmMapping: (mapping: ColumnMapping) => void;
  onBackToUpload: () => void;
}

/**
 * Stage 1 Sub-step: Column-to-Field Mapping View.
 * Matches uploaded spreadsheet headers to Agentbox fields.
 * Required fields: External record ID, Suburb, State, Postcode.
 */
export function MapFieldsView({
  fileSummary,
  initialMapping,
  onConfirmMapping,
  onBackToUpload,
}: MapFieldsViewProps) {
  const [mappings, setMappings] = useState<ColumnMapping>(initialMapping);
  const [isMappingsExpanded, setIsMappingsExpanded] = useState(false);

  // Auto-detect column mappings heuristically on mount
  useEffect(() => {
    if (Object.keys(mappings).length === 0) {
      const suggested: ColumnMapping = {};

      fileSummary.headers.forEach((header) => {
        const clean = header.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (clean.includes('externalid') || clean === 'id' || clean === 'recid' || clean.includes('recordid')) {
          suggested[header] = 'external_id';
        } else if (clean.includes('unit') || clean.includes('flat') || clean.includes('apt')) {
          suggested[header] = 'unit_number';
        } else if (clean.includes('streetno') || clean.includes('streetnum') || clean === 'num' || clean === 'number') {
          suggested[header] = 'street_number';
        } else if (clean.includes('streetname') || clean === 'street') {
          suggested[header] = 'street_name';
        } else if (clean.includes('streettype') || clean === 'type') {
          suggested[header] = 'street_type';
        } else if (clean.includes('suburb') || clean.includes('locality') || clean.includes('city')) {
          suggested[header] = 'suburb';
        } else if (clean === 'state' || clean.includes('province')) {
          suggested[header] = 'state';
        } else if (clean.includes('postcode') || clean.includes('zip') || clean === 'pc') {
          suggested[header] = 'postcode';
        } else if (clean.includes('address') || clean.includes('fulladdress')) {
          suggested[header] = 'full_address';
        } else if (clean.includes('source') || clean.includes('origin')) {
          suggested[header] = 'source_name';
        } else if (clean.includes('note') || clean.includes('comment')) {
          suggested[header] = 'notes';
        } else {
          suggested[header] = 'ignore';
        }
      });

      setMappings(suggested);
    }
  }, [fileSummary.headers, mappings]);

  // Update mapping for an individual column
  const handleMappingChange = (header: string, target: TargetField) => {
    setMappings((prev) => ({
      ...prev,
      [header]: target,
    }));
  };

  // Evaluate required fields gating status
  const requiredCheck = useMemo(() => {
    const assignedTargets = Object.values(mappings);
    const hasExternalId = assignedTargets.includes('external_id');
    const hasSuburb = assignedTargets.includes('suburb');
    const hasState = assignedTargets.includes('state');
    const hasPostcode = assignedTargets.includes('postcode');

    const missing: string[] = [];
    if (!hasExternalId) missing.push('External record ID');
    if (!hasSuburb) missing.push('Suburb');
    if (!hasState) missing.push('State');
    if (!hasPostcode) missing.push('Postcode');

    const mappedCount = Object.values(mappings).filter((m) => m !== 'ignore').length;
    const isAllReady = missing.length === 0;

    return {
      hasExternalId,
      hasSuburb,
      hasState,
      hasPostcode,
      missing,
      mappedCount,
      isAllReady,
    };
  }, [mappings]);

  // Live Row 1 Interpreted Address Preview
  const row1Preview = useMemo(() => {
    const row1 = fileSummary.previewRows[0] || {};
    let externalId = '';
    let unit = '';
    let streetNumber = '';
    let streetName = '';
    let streetType = '';
    let suburb = '';
    let state = '';
    let postcode = '';
    let fullAddress = '';

    for (const [colName, target] of Object.entries(mappings)) {
      const val = row1[colName] || '';
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

    if (fullAddress && !streetName && !suburb) {
      return {
        externalId: externalId || 'REC-1',
        interpretedAddress: fullAddress,
        isFullAddressCol: true,
      };
    }

    const interpreted = buildNormalisedAustralianAddress({
      unit,
      streetNumber,
      streetName,
      streetType,
      suburb,
      state,
      postcode,
    });

    return {
      externalId: externalId || 'REC-1',
      interpretedAddress: interpreted || '(Map fields to preview address)',
      isFullAddressCol: false,
    };
  }, [fileSummary.previewRows, mappings]);

  const hasFullAddressMapping = Object.values(mappings).includes('full_address');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#1a1c20] tracking-tight">
          Map columns to AgentIQ fields
        </h1>
        <p className="text-sm text-[#4d5158]">
          Review automatically suggested field mappings for your property dataset.
        </p>
      </div>

      {/* Confirmation Summary Card */}
      <div className="bg-white border border-[#e6e4df] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e6e4df]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#e5ebf0] text-[#0f3d52] flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="text-sm font-semibold text-[#1a1c20]">
                Smart Mapping Summary
              </div>
              <div className="text-xs text-[#4d5158]">
                {requiredCheck.mappedCount} of {fileSummary.columnCount} columns mapped to target fields
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMappingsExpanded(!isMappingsExpanded)}
            className="dmiq-btn-secondary text-xs self-start sm:self-center"
          >
            {isMappingsExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Hide mappings
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Review mappings
              </>
            )}
          </button>
        </div>

        {/* Required Fields Readiness Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              requiredCheck.hasExternalId
                ? 'bg-[#e4f0e9] border-[#1f6b3e]/30 text-[#1f6b3e]'
                : 'bg-[#faebd9] border-[#995c10]/30 text-[#995c10]'
            }`}
          >
            {requiredCheck.hasExternalId ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <div className="font-medium">External ID</div>
          </div>

          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              requiredCheck.hasSuburb
                ? 'bg-[#e4f0e9] border-[#1f6b3e]/30 text-[#1f6b3e]'
                : 'bg-[#faebd9] border-[#995c10]/30 text-[#995c10]'
            }`}
          >
            {requiredCheck.hasSuburb ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <div className="font-medium">Suburb</div>
          </div>

          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              requiredCheck.hasState
                ? 'bg-[#e4f0e9] border-[#1f6b3e]/30 text-[#1f6b3e]'
                : 'bg-[#faebd9] border-[#995c10]/30 text-[#995c10]'
            }`}
          >
            {requiredCheck.hasState ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <div className="font-medium">State</div>
          </div>

          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              requiredCheck.hasPostcode
                ? 'bg-[#e4f0e9] border-[#1f6b3e]/30 text-[#1f6b3e]'
                : 'bg-[#faebd9] border-[#995c10]/30 text-[#995c10]'
            }`}
          >
            {requiredCheck.hasPostcode ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <div className="font-medium">Postcode</div>
          </div>
        </div>

        {/* Interpreted Address Preview */}
        <div className="bg-[#f4f3f0] border border-[#e6e4df] rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#4d5158] flex items-center justify-between">
            <span>Interpreted Row 1 Preview</span>
            <span className="font-mono text-[10px] text-[#0f3d52] bg-[#e5ebf0] px-2 py-0.5 rounded">
              ID: {row1Preview.externalId}
            </span>
          </div>
          <div className="text-sm font-medium text-[#1a1c20] pt-0.5">
            {row1Preview.interpretedAddress}
          </div>
        </div>

        {/* Warning if "Full address" is mapped */}
        {hasFullAddressMapping && (
          <div className="bg-[#faebd9] border border-[#995c10]/30 text-[#995c10] p-3 rounded-lg text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Notice:</strong> Mapping a combined "Full address" column. Split address fields (Unit, Number, Street, Type) usually produce significantly more accurate Agentbox matches.
            </div>
          </div>
        )}
      </div>

      {/* Mapping Configuration Dropdowns */}
      {isMappingsExpanded && (
        <div className="bg-white border border-[#e6e4df] rounded-xl overflow-hidden shadow-xs animate-in fade-in duration-200">
          <div className="px-4 py-3 bg-[#f4f3f0] border-b border-[#e6e4df] flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4d5158]">
              Column Mapping Configuration
            </span>
            <span className="text-xs text-[#8a8f98]">
              {fileSummary.columnCount} total columns
            </span>
          </div>

          <div className="divide-y divide-[#e6e4df]">
            {fileSummary.headers.map((header) => {
              const currentTarget = mappings[header] || 'ignore';
              const targetMeta = TARGET_FIELDS.find((f) => f.value === currentTarget);
              const sampleVals = fileSummary.previewRows
                .slice(0, 3)
                .map((r) => r[header])
                .filter(Boolean)
                .join(', ');

              return (
                <div
                  key={header}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f9f8f6] transition-colors"
                >
                  {/* Column Label & Preview */}
                  <div className="space-y-1 sm:max-w-md">
                    <div className="text-sm font-semibold text-[#1a1c20] flex items-center gap-2">
                      <span>{header}</span>
                      {targetMeta?.required && (
                        <span className="text-[10px] uppercase font-bold bg-[#faebd9] text-[#995c10] px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#8a8f98] truncate">
                      Sample: {sampleVals || '(Empty)'}
                    </div>
                  </div>

                  {/* Field Selector */}
                  <div className="w-full sm:w-64">
                    <select
                      value={currentTarget}
                      onChange={(e) => handleMappingChange(header, e.target.value as TargetField)}
                      className="w-full bg-white border border-[#d0cdc6] rounded-lg px-3 py-1.5 text-xs text-[#1a1c20] focus:ring-1 focus:ring-[#0f3d52] focus:border-[#0f3d52]"
                    >
                      <optgroup label="Required AgentIQ Fields">
                        {TARGET_FIELDS.filter((f) => f.required).map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label} *
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Address & Metadata Fields">
                        {TARGET_FIELDS.filter((f) => !f.required && f.value !== 'ignore').map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Exclude">
                        <option value="ignore">Ignore (do not import)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Required Fields Guidance Alert */}
      {!requiredCheck.isAllReady && (
        <div className="bg-[#f9e2e2] border border-[#b22a2a]/30 text-[#b22a2a] p-3.5 rounded-lg text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold">
              Action required to proceed:
            </div>
            <div>
              Please map the following required fields: <strong>{requiredCheck.missing.join(', ')}</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToUpload}
          className="dmiq-btn-secondary text-xs sm:text-sm py-2.5 px-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to upload
        </button>

        <button
          type="button"
          disabled={!requiredCheck.isAllReady}
          onClick={() => onConfirmMapping(mappings)}
          className="dmiq-btn-primary py-2.5 px-6"
        >
          Check data quality
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
