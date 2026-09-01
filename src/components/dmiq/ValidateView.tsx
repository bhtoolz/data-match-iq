'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ban,
  ArrowLeft,
  ArrowRight,
  Download,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import {
  ValidationRow,
  ValidationStatus,
  ValidationSeverity,
} from '@/types/data-match-iq';
import {
  AU_STATES,
  validatePostcodeForState,
  buildNormalisedAustralianAddress,
} from '@/lib/australian-address-normalizer';

interface ValidateViewProps {
  rows: ValidationRow[];
  onUpdateRows: (updated: ValidationRow[]) => void;
  onProceedToMatching: () => void;
  onBackToMapping: () => void;
}

/**
 * Stage 2: Check & Resolve Data Issues.
 * Address validation and exception handling queue.
 * Surfaces Australian address anomalies (missing postcode, bad state, duplicates, unparseable rows),
 * provides batch corrections and row-level fixes, and calculates live readiness metrics.
 */
export function ValidateView({
  rows,
  onUpdateRows,
  onProceedToMatching,
  onBackToMapping,
}: ValidateViewProps) {
  const [activeTab, setActiveTab] = useState<'needs_attention' | 'all'>('needs_attention');
  const [editingRow, setEditingRow] = useState<ValidationRow | null>(null);
  const [editPostcode, setEditPostcode] = useState('');
  const [editState, setEditState] = useState('');

  // Calculate live dataset summary counts
  const counts = useMemo(() => {
    let ready = 0;
    let warnings = 0;
    let invalid = 0;
    let duplicate = 0;
    let excluded = 0;

    rows.forEach((r) => {
      if (r.status === 'ready') ready += 1;
      else if (r.status === 'excluded') excluded += 1;
      else if (r.status === 'duplicate') {
        duplicate += 1;
        warnings += 1;
      } else if (r.severity === 'warning') warnings += 1;
      else if (r.severity === 'invalid') invalid += 1;
    });

    const needsAttentionCount = rows.filter(
      (r) => r.status !== 'ready' && r.status !== 'excluded'
    ).length;

    return {
      total: rows.length,
      ready,
      warnings,
      invalid,
      duplicate,
      excluded,
      needsAttentionCount,
    };
  }, [rows]);

  // Rows filtered by the active tab
  const displayedRows = useMemo(() => {
    if (activeTab === 'all') return rows;

    // "Needs attention" sorted errors first
    return rows
      .filter((r) => r.status !== 'ready' && r.status !== 'excluded')
      .sort((a, b) => {
        const score = (row: ValidationRow) => {
          if (row.severity === 'invalid') return 1;
          if (row.severity === 'warning') return 2;
          return 3;
        };
        return score(a) - score(b);
      });
  }, [rows, activeTab]);

  // Batch action: Accept all auto-suggested state/postcode corrections
  const handleBatchAcceptSuggestions = () => {
    const updated = rows.map((r) => {
      if (r.suggestedCorrection && r.status !== 'ready' && r.status !== 'excluded') {
        const corr = r.suggestedCorrection;
        const newComponents = { ...r.parsedComponents };

        if (corr.field === 'state') newComponents.state = corr.suggestedValue;
        if (corr.field === 'postcode') newComponents.postcode = corr.suggestedValue;

        const newNormalised = buildNormalisedAustralianAddress(newComponents);

        return {
          ...r,
          normalised: newNormalised,
          status: 'ready' as ValidationStatus,
          severity: 'ok' as ValidationSeverity,
          issue: '—',
          actionLabel: undefined,
          suggestedCorrection: undefined,
          parsedComponents: newComponents,
          isResolved: true,
        };
      }
      return r;
    });

    onUpdateRows(updated);
  };

  // Batch action: Exclude all unparseable records from matching
  const handleBatchExcludeUnparseable = () => {
    const updated = rows.map((r) => {
      if (r.status === 'unparseable') {
        return {
          ...r,
          status: 'excluded' as ValidationStatus,
          severity: 'neutral' as ValidationSeverity,
          issue: 'Excluded from matching',
          actionLabel: undefined,
        };
      }
      return r;
    });

    onUpdateRows(updated);
  };

  // Single-row Quick Action for auto-suggested correction (e.g. Set to QLD)
  const handleApplySingleSuggestion = (row: ValidationRow) => {
    if (!row.suggestedCorrection) return;

    const corr = row.suggestedCorrection;
    const newComponents = { ...row.parsedComponents };
    if (corr.field === 'state') newComponents.state = corr.suggestedValue;
    if (corr.field === 'postcode') newComponents.postcode = corr.suggestedValue;

    const newNormalised = buildNormalisedAustralianAddress(newComponents);

    const updated = rows.map((r) => {
      if (r.id === row.id) {
        return {
          ...r,
          normalised: newNormalised,
          status: 'ready' as ValidationStatus,
          severity: 'ok' as ValidationSeverity,
          issue: '—',
          actionLabel: undefined,
          suggestedCorrection: undefined,
          parsedComponents: newComponents,
          isResolved: true,
        };
      }
      return r;
    });

    onUpdateRows(updated);
  };

  // Exclude a single row
  const handleExcludeRow = (rowId: number) => {
    const updated = rows.map((r) => {
      if (r.id === rowId) {
        return {
          ...r,
          status: 'excluded' as ValidationStatus,
          severity: 'neutral' as ValidationSeverity,
          issue: 'Excluded from matching',
          actionLabel: undefined,
        };
      }
      return r;
    });
    onUpdateRows(updated);
  };

  // Keep a duplicate row and mark it ready
  const handleMarkReady = (rowId: number) => {
    const updated = rows.map((r) => {
      if (r.id === rowId) {
        return {
          ...r,
          status: 'ready' as ValidationStatus,
          severity: 'ok' as ValidationSeverity,
          issue: '—',
          actionLabel: undefined,
          isResolved: true,
        };
      }
      return r;
    });
    onUpdateRows(updated);
  };

  // Open inline edit modal for custom postcode/state entry
  const handleOpenEditModal = (row: ValidationRow) => {
    setEditingRow(row);
    setEditPostcode(row.parsedComponents.postcode || '');
    setEditState(row.parsedComponents.state || 'NSW');
  };

  // Save manual edit and re-validate
  const handleSaveModalEdit = () => {
    if (!editingRow) return;

    const updated = rows.map((r) => {
      if (r.id === editingRow.id) {
        const newComp = {
          ...r.parsedComponents,
          postcode: editPostcode.trim(),
          state: editState.trim().toUpperCase(),
        };

        const isValidPostcode = validatePostcodeForState(newComp.postcode, newComp.state);
        const newNormalised = buildNormalisedAustralianAddress(newComp);

        return {
          ...r,
          normalised: newNormalised,
          parsedComponents: newComp,
          status: (isValidPostcode ? 'ready' : 'invalid_postcode') as ValidationStatus,
          severity: (isValidPostcode ? 'ok' : 'invalid') as ValidationSeverity,
          issue: isValidPostcode ? '—' : `Invalid postcode '${editPostcode}' for ${newComp.state}`,
          actionLabel: isValidPostcode ? undefined : 'Correct postcode',
          suggestedCorrection: undefined,
          isResolved: isValidPostcode,
        };
      }
      return r;
    });

    onUpdateRows(updated);
    setEditingRow(null);
  };

  // Export Invalid Rows as CSV (PRD §5.3)
  const handleExportInvalidRows = () => {
    const invalidRows = rows.filter((r) => r.severity === 'invalid');
    if (invalidRows.length === 0) return;

    const csvHeaders = ['Row ID', 'External ID', 'Original Address', 'Validation Status', 'Issue Description'];
    const csvLines = [csvHeaders.join(',')];

    invalidRows.forEach((r) => {
      const line = [
        r.sourceRow,
        `"${r.externalId}"`,
        `"${r.original.replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${r.issue.replace(/"/g, '""')}"`,
      ];
      csvLines.push(line.join(','));
    });

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invalid_property_records_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Header & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#1a1c20] tracking-tight">
          Check and resolve data issues
        </h1>
        <p className="text-sm text-[#4d5158]">
          Review formatting issues. <strong>{counts.ready}</strong> of <strong>{counts.total}</strong> rows are ready to match.
        </p>
      </div>

      {/* Live Status Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#e6e4df] rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] text-[#4d5158] uppercase font-semibold">Total rows</div>
          <div className="text-xl font-bold text-[#1a1c20] mt-0.5">{counts.total}</div>
        </div>

        <div className="bg-white border border-[#e6e4df] rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] text-[#1f6b3e] uppercase font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
          </div>
          <div className="text-xl font-bold text-[#1f6b3e] mt-0.5">{counts.ready}</div>
        </div>

        <div className="bg-white border border-[#e6e4df] rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] text-[#995c10] uppercase font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Warnings
          </div>
          <div className="text-xl font-bold text-[#995c10] mt-0.5">{counts.warnings}</div>
        </div>

        <div className="bg-white border border-[#e6e4df] rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] text-[#b22a2a] uppercase font-semibold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Invalid
          </div>
          <div className="text-xl font-bold text-[#b22a2a] mt-0.5">{counts.invalid}</div>
        </div>

        <div className="bg-white border border-[#e6e4df] rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] text-[#4d5158] uppercase font-semibold">Duplicates</div>
          <div className="text-xl font-bold text-[#1a1c20] mt-0.5">{counts.duplicate}</div>
        </div>

        {counts.excluded > 0 && (
          <div className="bg-white border border-[#e6e4df] rounded-xl p-3.5 shadow-2xs">
            <div className="text-[11px] text-[#8a8f98] uppercase font-semibold flex items-center gap-1">
              <Ban className="w-3.5 h-3.5" /> Excluded
            </div>
            <div className="text-xl font-bold text-[#8a8f98] mt-0.5">{counts.excluded}</div>
          </div>
        )}
      </div>

      {/* Invalid Records Notice Banner */}
      {counts.invalid > 0 && (
        <div className="bg-[#faebd9] border border-[#995c10]/30 text-[#995c10] p-4 rounded-xl text-xs flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Note regarding invalid rows:</strong> {counts.invalid} record(s) contain invalid postcodes or unrecognised states. These rows will be excluded from the Agentbox matching run and carried into the final results table with status <strong>Invalid</strong>.
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportInvalidRows}
            className="dmiq-btn-secondary text-[11px] py-1 px-3 shrink-0 bg-white"
          >
            <Download className="w-3 h-3" />
            Export invalid CSV
          </button>
        </div>
      )}

      {/* Batch Action Bar & Filter Tabs */}
      <div className="bg-white border border-[#e6e4df] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('needs_attention')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'needs_attention'
                ? 'bg-[#0f3d52] text-white'
                : 'bg-[#f4f3f0] text-[#4d5158] hover:bg-[#e5ebf0]'
            }`}
          >
            Needs attention ({counts.needsAttentionCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0f3d52] text-white'
                : 'bg-[#f4f3f0] text-[#4d5158] hover:bg-[#e5ebf0]'
            }`}
          >
            All rows ({counts.total})
          </button>
        </div>

        {/* Right: Safe Batch Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBatchAcceptSuggestions}
            className="dmiq-btn-secondary text-xs py-1.5 px-3"
            title="Accept all auto-suggested state/postcode corrections"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0f3d52]" />
            Accept suggested fixes
          </button>
          <button
            type="button"
            onClick={handleBatchExcludeUnparseable}
            className="dmiq-btn-secondary text-xs py-1.5 px-3 text-[#b22a2a] hover:bg-[#f9e2e2]"
            title="Exclude rows that cannot be parsed"
          >
            <Ban className="w-3.5 h-3.5" />
            Exclude unparseable
          </button>
        </div>
      </div>

      {/* Validation Exception Table */}
      <div className="bg-white border border-[#e6e4df] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f4f3f0] text-[#4d5158] uppercase font-semibold text-[11px] border-b border-[#e6e4df] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 border-r border-[#e6e4df] w-12 text-center bg-[#f4f3f0]">
                  #
                </th>
                <th className="py-2.5 px-3 border-r border-[#e6e4df] bg-[#f4f3f0]">
                  Original Address
                </th>
                <th className="py-2.5 px-3 border-r border-[#e6e4df] bg-[#f4f3f0]">
                  Normalised Address
                </th>
                <th className="py-2.5 px-3 border-r border-[#e6e4df] w-32 bg-[#f4f3f0]">
                  Status
                </th>
                <th className="py-2.5 px-3 border-r border-[#e6e4df] bg-[#f4f3f0]">
                  Issue
                </th>
                <th className="py-2.5 px-3 text-right w-36 bg-[#f4f3f0]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e4df] text-[#1a1c20]">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8a8f98]">
                    <CheckCircle2 className="w-6 h-6 text-[#1f6b3e] mx-auto mb-1" />
                    All records in this view are ready to match!
                  </td>
                </tr>
              ) : (
                displayedRows.map((row) => {
                  return (
                    <tr key={row.id} className="hover:bg-[#f9f8f6] transition-colors">
                      <td className="py-2.5 px-3 border-r border-[#e6e4df] text-center font-mono text-[#8a8f98]">
                        {row.sourceRow}
                      </td>

                      {/* Original Address */}
                      <td className="py-2.5 px-3 border-r border-[#e6e4df] font-mono text-[11px] text-[#4d5158]">
                        {row.original}
                      </td>

                      {/* Normalised Address */}
                      <td className="py-2.5 px-3 border-r border-[#e6e4df] font-medium">
                        {row.normalised === '-' ? (
                          <span className="text-[#8a8f98] italic font-mono">-</span>
                        ) : (
                          <span>{row.normalised}</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-2.5 px-3 border-r border-[#e6e4df]">
                        {row.status === 'ready' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#e4f0e9] text-[#1f6b3e]">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        )}
                        {row.status === 'missing_info' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#faebd9] text-[#995c10]">
                            <AlertTriangle className="w-3 h-3" /> Missing info
                          </span>
                        )}
                        {row.status === 'incomplete' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#faebd9] text-[#995c10]">
                            <AlertTriangle className="w-3 h-3" /> Incomplete
                          </span>
                        )}
                        {row.status === 'duplicate' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#faebd9] text-[#995c10]">
                            <AlertTriangle className="w-3 h-3" /> Duplicate
                          </span>
                        )}
                        {row.status === 'invalid_postcode' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f9e2e2] text-[#b22a2a]">
                            <XCircle className="w-3 h-3" /> Invalid postcode
                          </span>
                        )}
                        {row.status === 'unrecognised_state' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f9e2e2] text-[#b22a2a]">
                            <XCircle className="w-3 h-3" /> Bad state
                          </span>
                        )}
                        {row.status === 'unparseable' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f9e2e2] text-[#b22a2a]">
                            <XCircle className="w-3 h-3" /> Unparseable
                          </span>
                        )}
                        {row.status === 'excluded' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f4f3f0] text-[#8a8f98]">
                            <Ban className="w-3 h-3" /> Excluded
                          </span>
                        )}
                      </td>

                      {/* Issue Description */}
                      <td className="py-2.5 px-3 border-r border-[#e6e4df] text-xs">
                        {row.issue !== '—' ? (
                          <span className="text-[#995c10] font-medium">{row.issue}</span>
                        ) : (
                          <span className="text-[#8a8f98]">—</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-2 px-3 text-right">
                        {row.status === 'unparseable' ? (
                          <button
                            type="button"
                            onClick={() => handleExcludeRow(row.id)}
                            className="dmiq-btn-text text-[11px] py-1 px-2 text-[#b22a2a]"
                          >
                            <Ban className="w-3 h-3" /> Exclude
                          </button>
                        ) : row.status === 'duplicate' ? (
                          <button
                            type="button"
                            onClick={() => handleMarkReady(row.id)}
                            className="dmiq-btn-text text-[11px] py-1 px-2 text-[#1f6b3e]"
                          >
                            <Check className="w-3 h-3" /> Keep row
                          </button>
                        ) : row.suggestedCorrection ? (
                          <button
                            type="button"
                            onClick={() => handleApplySingleSuggestion(row)}
                            className="dmiq-btn-secondary text-[11px] py-1 px-2.5 font-medium text-[#0f3d52] bg-[#e5ebf0]/50"
                          >
                            <Sparkles className="w-3 h-3" /> {row.actionLabel}
                          </button>
                        ) : row.actionLabel ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(row)}
                            className="dmiq-btn-secondary text-[11px] py-1 px-2.5 font-medium"
                          >
                            <Edit2 className="w-3 h-3" /> {row.actionLabel}
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#8a8f98]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBackToMapping}
          className="dmiq-btn-secondary text-xs sm:text-sm py-2.5 px-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to map fields
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={counts.ready === 0}
            onClick={onProceedToMatching}
            className="dmiq-btn-primary py-2.5 px-6 font-semibold"
          >
            Match {counts.ready} ready records
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit Address Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-[#1a1c20]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#e6e4df] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[#1a1c20]">
                Edit Address Record #{editingRow.sourceRow}
              </h3>
              <p className="text-xs text-[#4d5158]">
                Original: <span className="font-mono text-[#1a1c20]">{editingRow.original}</span>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#4d5158] mb-1">
                  Australian State
                </label>
                <select
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  className="w-full bg-white border border-[#d0cdc6] rounded-lg px-3 py-2 text-xs text-[#1a1c20]"
                >
                  {Object.keys(AU_STATES)
                    .filter((k) => k.length === 3 || k.length === 2)
                    .map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d5158] mb-1">
                  4-Digit Postcode
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={editPostcode}
                  onChange={(e) => setEditPostcode(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full bg-white border border-[#d0cdc6] rounded-lg px-3 py-2 text-xs text-[#1a1c20] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e6e4df]">
              <button
                type="button"
                onClick={() => {
                  handleExcludeRow(editingRow.id);
                  setEditingRow(null);
                }}
                className="dmiq-btn-text text-xs text-[#b22a2a]"
              >
                <Ban className="w-3.5 h-3.5" />
                Exclude record
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="dmiq-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalEdit}
                  className="dmiq-btn-primary text-xs"
                >
                  Save & Validate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
