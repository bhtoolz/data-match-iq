'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Download,
  Search,
  RotateCcw,
  User,
  ChevronRight,
  X,
  Building,
  Phone,
  Mail,
} from 'lucide-react';
import {
  MatchResult,
  UploadedFileSummary,
} from '@/types/data-match-iq';

interface ResultsViewProps {
  fileSummary: UploadedFileSummary;
  results: MatchResult[];
  onStartAnotherMatch: () => void;
}

/**
 * Stage 3: Results Call List & CSV Exports.
 * Read-only 3-column call list with filter chips (defaults to 'Review required' per PRD §5.5),
 * instant full-text search, slide-over detail inspector drawer, and dual CSV export engines.
 */
export function ResultsView({
  fileSummary,
  results,
  onStartAnotherMatch,
}: ResultsViewProps) {
  // PRD §5.5: "Default the result filter to Review required so uncertain matches are inspected first."
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Review required' | 'Matched' | 'No match' | 'Invalid'>('Review required');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResultForDrawer, setSelectedResultForDrawer] = useState<MatchResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derive outcome metrics
  const counts = useMemo(() => {
    let matched = 0;
    let reviewRequired = 0;
    let noMatch = 0;
    let invalid = 0;

    results.forEach((r) => {
      if (r.status === 'Matched') matched += 1;
      else if (r.status === 'Review required') reviewRequired += 1;
      else if (r.status === 'No match') noMatch += 1;
      else if (r.status === 'Invalid') invalid += 1;
    });

    return {
      total: results.length,
      matched,
      reviewRequired,
      noMatch,
      invalid,
    };
  }, [results]);

  // Dynamic filter and search
  const filteredResults = useMemo(() => {
    let list = results;

    // Filter by status chip
    if (selectedFilter !== 'all') {
      list = list.filter((r) => r.status === selectedFilter);
    }

    // Search query across uploaded address, contact name, contact address, external ID
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const upAddr = r.uploadedAddress.toLowerCase();
        const normAddr = r.normalisedAddress.toLowerCase();
        const cName = (r.suggestedContact?.name || '').toLowerCase();
        const cAddr = (r.suggestedContact?.address || '').toLowerCase();
        const cId = (r.suggestedContact?.contactId || '').toLowerCase();
        const extId = (r.externalId || '').toLowerCase();

        return (
          upAddr.includes(q) ||
          normAddr.includes(q) ||
          cName.includes(q) ||
          cAddr.includes(q) ||
          cId.includes(q) ||
          extId.includes(q)
        );
      });
    }

    return list;
  }, [results, selectedFilter, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Export 1: Matched Contacts CSV (High confidence only)
  const handleExportMatched = () => {
    const matchedRows = results.filter((r) => r.status === 'Matched');
    if (matchedRows.length === 0) {
      showToast('No matched contacts available to export.');
      return;
    }

    const headers = [
      'Source Row',
      'External Record ID',
      'Agentbox Contact ID',
      'Contact Full Name',
      'Contact Address',
      'Phone',
      'Email',
      'Assigned Agent',
      'Confidence Score',
      'Confidence Reason',
    ];

    const lines = [headers.join(',')];
    matchedRows.forEach((r) => {
      const c = r.suggestedContact;
      const line = [
        r.sourceRow,
        `"${r.externalId}"`,
        `"${c?.contactId || ''}"`,
        `"${c?.name || ''}"`,
        `"${c?.address || ''}"`,
        `"${c?.phone || ''}"`,
        `"${c?.email || ''}"`,
        `"${c?.assignedAgent || ''}"`,
        `"${r.confidenceScore}%"`,
        `"${r.confidenceReason}"`,
      ];
      lines.push(line.join(','));
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mcgrath_matched_call_list_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Successfully exported ${matchedRows.length} matched contact(s) to CSV.`);
  };

  // Export 2: All Results CSV (Full audit breakdown)
  const handleExportAll = () => {
    const headers = [
      'Source Row',
      'External Record ID',
      'Uploaded Address',
      'Normalised Address',
      'Matched Contact Name',
      'Matched Contact Address',
      'Agentbox Contact ID',
      'Match Status',
      'Confidence Label',
      'Confidence Score',
      'Confidence Reason',
      'Detailed Match Explanation',
    ];

    const lines = [headers.join(',')];
    results.forEach((r) => {
      const c = r.suggestedContact;
      const line = [
        r.sourceRow,
        `"${r.externalId}"`,
        `"${r.uploadedAddress.replace(/"/g, '""')}"`,
        `"${r.normalisedAddress.replace(/"/g, '""')}"`,
        `"${(c?.name || '').replace(/"/g, '""')}"`,
        `"${(c?.address || '').replace(/"/g, '""')}"`,
        `"${c?.contactId || ''}"`,
        `"${r.status}"`,
        `"${r.confidenceLabel}"`,
        r.confidenceScore !== null ? `"${r.confidenceScore}%"` : '""',
        `"${r.confidenceReason.replace(/"/g, '""')}"`,
        `"${r.matchReason.replace(/"/g, '""')}"`,
      ];
      lines.push(line.join(','));
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mcgrath_all_match_results_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Successfully exported complete dataset (${results.length} records) to CSV.`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f3d52] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#d0cdc6]/30 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-[#e4f0e9]" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#1a1c20] tracking-tight">
            Match results
          </h1>
          <p className="text-xs text-[#4d5158]">
            Dataset: <span className="font-semibold text-[#1a1c20]">{fileSummary.name}</span> · Processed at {new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onStartAnotherMatch}
            className="dmiq-btn-secondary text-xs py-2 px-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start another match
          </button>
          <button
            type="button"
            onClick={handleExportMatched}
            className="dmiq-btn-primary text-xs py-2 px-3.5 font-semibold bg-[#1f6b3e] hover:bg-[#185330]"
          >
            <Download className="w-3.5 h-3.5" />
            Export matched contacts ({counts.matched})
          </button>
          <button
            type="button"
            onClick={handleExportAll}
            className="dmiq-btn-secondary text-xs py-2 px-3.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export all ({counts.total})
          </button>
        </div>
      </div>

      {/* Outcome Lead Card */}
      <div className="bg-white border border-[#e6e4df] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-lg font-bold text-[#1a1c20] flex items-center gap-2">
              <span className="text-[#1f6b3e] font-extrabold">{counts.matched}</span> contacts ready to export
            </div>
            <p className="text-xs text-[#4d5158]">
              {counts.reviewRequired} review required · {counts.noMatch} unmatched · {counts.invalid} invalid records
            </p>
          </div>

          <div className="text-xs text-[#8a8f98] font-mono">
            Overall match rate: {counts.total > 0 ? Math.round((counts.matched / counts.total) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedFilter('Review required')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            selectedFilter === 'Review required'
              ? 'bg-[#faebd9] text-[#995c10] border-[#995c10]'
              : 'bg-white text-[#4d5158] border-[#e6e4df] hover:border-[#d0cdc6]'
          }`}
        >
          Review required ({counts.reviewRequired})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('Matched')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            selectedFilter === 'Matched'
              ? 'bg-[#e4f0e9] text-[#1f6b3e] border-[#1f6b3e]'
              : 'bg-white text-[#4d5158] border-[#e6e4df] hover:border-[#d0cdc6]'
          }`}
        >
          Matched ({counts.matched})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('No match')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            selectedFilter === 'No match'
              ? 'bg-[#f4f3f0] text-[#1a1c20] border-[#1a1c20]'
              : 'bg-white text-[#4d5158] border-[#e6e4df] hover:border-[#d0cdc6]'
          }`}
        >
          No match ({counts.noMatch})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('Invalid')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            selectedFilter === 'Invalid'
              ? 'bg-[#f9e2e2] text-[#b22a2a] border-[#b22a2a]'
              : 'bg-white text-[#4d5158] border-[#e6e4df] hover:border-[#d0cdc6]'
          }`}
        >
          Invalid ({counts.invalid})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#0f3d52] text-white border-[#0f3d52]'
              : 'bg-white text-[#4d5158] border-[#e6e4df] hover:border-[#d0cdc6]'
          }`}
        >
          View all ({counts.total})
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-[#e6e4df] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8a8f98] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search addresses or contacts…"
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#d0cdc6] rounded-lg text-[#1a1c20] focus:ring-1 focus:ring-[#0f3d52]"
          />
        </div>

        <div className="text-xs text-[#8a8f98]">
          Showing {filteredResults.length} of {results.length} records
        </div>
      </div>

      {/* Read-Only Results Table */}
      <div className="bg-white border border-[#e6e4df] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f4f3f0] text-[#4d5158] uppercase font-semibold text-[11px] border-b border-[#e6e4df] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-4 border-r border-[#e6e4df] w-2/5 bg-[#f4f3f0]">
                  Uploaded address
                </th>
                <th className="py-2.5 px-4 border-r border-[#e6e4df] w-2/5 bg-[#f4f3f0]">
                  Matched Agentbox contact
                </th>
                <th className="py-2.5 px-4 w-1/5 bg-[#f4f3f0]">
                  Match assessment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e4df] text-[#1a1c20]">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[#8a8f98]">
                    No records match the current filter and search query.
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => {
                  const contact = result.suggestedContact;

                  return (
                    <tr
                      key={result.id}
                      onClick={() => setSelectedResultForDrawer(result)}
                      className="hover:bg-[#f9f8f6] cursor-pointer transition-colors group"
                    >
                      {/* 1. Uploaded Address */}
                      <td className="py-3 px-4 border-r border-[#e6e4df] align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[#4d5158] bg-[#f4f3f0] px-1.5 py-0.5 rounded">
                              Row {result.sourceRow}
                            </span>
                            <span className="font-mono text-[10px] text-[#0f3d52] bg-[#e5ebf0] px-1.5 py-0.5 rounded font-medium">
                              {result.externalId}
                            </span>
                          </div>
                          <div className="font-medium text-[#1a1c20] text-xs leading-snug">
                            {result.uploadedAddress}
                          </div>
                        </div>
                      </td>

                      {/* 2. Matched Agentbox Contact */}
                      <td className="py-3 px-4 border-r border-[#e6e4df] align-top">
                        {contact ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-[#0f3d52] shrink-0" />
                              <span className="font-bold text-[#1a1c20] text-xs">
                                {contact.name}
                              </span>
                              <span className="font-mono text-[10px] text-[#8a8f98]">
                                {contact.contactId}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#4d5158] pl-5.5 leading-snug">
                              {contact.address}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[#8a8f98] italic text-xs py-1">
                            <User className="w-3.5 h-3.5 opacity-40" />
                            <span>No suggestion</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Match Assessment */}
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            {/* Status Badges */}
                            {result.status === 'Matched' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e4f0e9] text-[#1f6b3e]">
                                <CheckCircle2 className="w-3 h-3" />
                                {result.confidenceLabel} match · {result.confidenceScore}%
                              </span>
                            )}
                            {result.status === 'Review required' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#faebd9] text-[#995c10]">
                                <AlertTriangle className="w-3 h-3" />
                                {result.confidenceLabel} match · {result.confidenceScore}%
                              </span>
                            )}
                            {result.status === 'No match' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f4f3f0] text-[#4d5158]">
                                <HelpCircle className="w-3 h-3" />
                                No match {result.confidenceScore !== null ? `· ${result.confidenceScore}%` : ''}
                              </span>
                            )}
                            {result.status === 'Invalid' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f9e2e2] text-[#b22a2a]">
                                <XCircle className="w-3 h-3" />
                                Invalid
                              </span>
                            )}

                            <ChevronRight className="w-3.5 h-3.5 text-[#d0cdc6] group-hover:text-[#0f3d52] transition-colors" />
                          </div>

                          <div className="text-[11px] text-[#4d5158] leading-tight">
                            {result.confidenceReason}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match Detail Inspector Slide-Over Drawer */}
      {selectedResultForDrawer && (
        <div className="fixed inset-0 bg-[#1a1c20]/40 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full p-6 shadow-2xl overflow-y-auto space-y-6 border-l border-[#e6e4df]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#4d5158]">
                  Match Detail Inspector
                </div>
                <h3 className="text-base font-bold text-[#1a1c20]">
                  Record #{selectedResultForDrawer.sourceRow} ({selectedResultForDrawer.externalId})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResultForDrawer(null)}
                className="w-8 h-8 rounded-full hover:bg-[#f4f3f0] flex items-center justify-center text-[#4d5158] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assessment Card */}
            <div className="bg-[#f4f3f0] border border-[#e6e4df] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[#4d5158]">Assessment Outcome</span>
                <span className="font-mono text-xs font-bold text-[#0f3d52]">
                  {selectedResultForDrawer.confidenceScore !== null ? `${selectedResultForDrawer.confidenceScore}% Confidence` : 'Score N/A'}
                </span>
              </div>
              <div className="text-sm font-semibold text-[#1a1c20]">
                {selectedResultForDrawer.confidenceReason}
              </div>
              <p className="text-xs text-[#4d5158] leading-relaxed">
                {selectedResultForDrawer.matchReason}
              </p>
            </div>

            {/* Comparison Details */}
            <div className="space-y-4">
              {/* Uploaded Property */}
              <div className="border border-[#e6e4df] rounded-xl p-4 space-y-2">
                <div className="text-xs font-semibold text-[#0f3d52] uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Uploaded Property
                </div>
                <div className="text-sm font-medium text-[#1a1c20]">
                  {selectedResultForDrawer.uploadedAddress}
                </div>
                <div className="text-xs text-[#4d5158] font-mono">
                  Normalised: {selectedResultForDrawer.normalisedAddress}
                </div>
              </div>

              {/* Matched Agentbox Contact */}
              <div className="border border-[#e6e4df] rounded-xl p-4 space-y-2">
                <div className="text-xs font-semibold text-[#1f6b3e] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Matched Agentbox CRM Contact
                </div>
                {selectedResultForDrawer.suggestedContact ? (
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-[#1a1c20]">
                      {selectedResultForDrawer.suggestedContact.name}
                    </div>
                    <div className="text-xs text-[#4d5158]">
                      {selectedResultForDrawer.suggestedContact.address}
                    </div>
                    <div className="pt-2 border-t border-[#e6e4df] grid grid-cols-2 gap-2 text-[11px] text-[#4d5158]">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#0f3d52]" />
                        <span>{selectedResultForDrawer.suggestedContact.phone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-[#0f3d52]" />
                        <span className="truncate">{selectedResultForDrawer.suggestedContact.email || '—'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#8a8f98] italic py-2">
                    No contact currently linked in Agentbox database for this locality.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#e6e4df] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedResultForDrawer(null)}
                className="dmiq-btn-secondary text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
