'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Table,
  Sparkles,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadedFileSummary } from '@/types/data-match-iq';
import { SAMPLE_CSV_CONTENT, downloadSampleCSV } from '@/lib/sample-datasets';

interface UploadViewProps {
  fileSummary: UploadedFileSummary | null;
  onFileUpload: (summary: UploadedFileSummary) => void;
  onProceedToMapping: () => void;
  onResetFile: () => void;
}

/**
 * Stage 1: Upload View for Data Match IQ.
 * Allows non-technical staff to upload CSV / XLSX property datasets up to 10 MB,
 * inspect a 5-row preview with explicit Empty cell indicators, and proceed to column mapping.
 */
export function UploadView({
  fileSummary,
  onFileUpload,
  onProceedToMapping,
  onResetFile,
}: UploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);

  // Format file size in KB or MB
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Process and validate parsed row records
  const processRawData = (name: string, size: number, rows: Record<string, string>[]) => {
    if (!rows || rows.length === 0) {
      setErrorMessage('The uploaded file appears to be empty.');
      setIsParsing(false);
      return;
    }

    const headers = Object.keys(rows[0] || {});
    if (headers.length === 0) {
      setErrorMessage('Could not detect header columns in the file.');
      setIsParsing(false);
      return;
    }

    const summary: UploadedFileSummary = {
      id: `UP-${Date.now()}`,
      name,
      size,
      formattedSize: formatFileSize(size),
      rowCount: rows.length,
      columnCount: headers.length,
      headers,
      previewRows: rows.slice(0, 5),
      allRawRows: rows,
      uploadedAt: new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
    };

    setErrorMessage(null);
    setIsParsing(false);
    onFileUpload(summary);
  };

  // Handle incoming file selection (CSV or XLSX)
  const handleFile = (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB limit as per PRD §5.1
    if (file.size > MAX_SIZE) {
      setErrorMessage('File size exceeds the 10 MB limit. Please upload a smaller file.');
      return;
    }

    setIsParsing(true);
    setErrorMessage(null);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv' || file.type === 'text/csv') {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: false,
        complete: (results) => {
          processRawData(file.name, file.size, results.data);
        },
        error: (error) => {
          setErrorMessage(`CSV parsing error: ${error.message}`);
          setIsParsing(false);
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { raw: false });
          processRawData(file.name, file.size, jsonData);
        } catch (err: any) {
          setErrorMessage(`Excel parsing error: ${err?.message || 'Could not parse workbook'}`);
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read file from disk.');
        setIsParsing(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMessage('Invalid file type. Please upload a CSV or XLSX file.');
      setIsParsing(false);
    }
  };

  // Drag and drop event handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Quick Load of Demo Dataset for immediate testing
  const handleLoadSampleData = () => {
    setIsParsing(true);
    Papa.parse<Record<string, string>>(SAMPLE_CSV_CONTENT, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        processRawData('mcgrath_sample_property_campaign.csv', 1845, results.data);
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* Page Title & Subtitle */}
      <div className="text-center space-y-1.5 pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1c20] tracking-tight">
          Match uploaded property data
        </h1>
        <p className="text-sm sm:text-base text-[#4d5158]">
          Upload a property list and compare it with Agentbox records.
        </p>
      </div>

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="p-4 bg-[#f9e2e2] border border-[#b22a2a] rounded-lg text-[#b22a2a] text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {!fileSummary ? (
        /* Empty State Drop Zone strictly matching Prototype & PRD §5.1 */
        <div className="space-y-3">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all bg-white ${
              isDragging
                ? 'border-[#0f3d52] bg-[#e5ebf0]/40'
                : 'border-[#d0cdc6] hover:border-[#8a8f98]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
            />

            <div className="max-w-md mx-auto space-y-4 flex flex-col items-center">
              {/* Circular Upload Cloud Icon */}
              <div className="w-14 h-14 rounded-full bg-[#e5ebf0] text-[#0f3d52] flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>

              {/* Primary Choose File Button */}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsing}
                  className="dmiq-btn-primary px-7 py-2.5 text-sm font-medium"
                >
                  {isParsing ? 'Reading file...' : 'Choose CSV or Excel file'}
                </button>
              </div>

              {/* Drag and Drop Instructions */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#1a1c20]">
                  Drag and drop a file here
                </p>
                <p className="text-xs text-[#8a8f98]">
                  CSV or XLSX, up to 10 MB
                </p>
              </div>

              {/* Subtle Center Divider */}
              <div className="w-12 h-px bg-[#e6e4df] my-1" />

              {/* Clean Single-Line Download Sample File Link (No Wrapping) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="dmiq-btn-text text-xs text-[#0f3d52] hover:underline flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download sample file</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Demo Helper Card for Developer & Reviewer Convenience */}
          <div className="flex items-center justify-between p-3 bg-white border border-[#e6e4df] rounded-xl text-xs text-[#4d5158]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0f3d52] shrink-0" />
              <span>Want to evaluate immediately without uploading your own file?</span>
            </div>
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="dmiq-btn-secondary text-xs py-1.5 px-3 font-semibold text-[#0f3d52] hover:bg-[#e5ebf0] shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1f6b3e]" />
              Load sample dataset (22 rows)
            </button>
          </div>
        </div>
      ) : (
        /* Uploaded State: Summary Card + Data Preview Table */
        <div className="space-y-6">
          {/* File Summary Card */}
          <div className="bg-white border border-[#e6e4df] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-[#e4f0e9] text-[#1f6b3e] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-[#1a1c20] text-base flex items-center gap-2">
                  <span>{fileSummary.name}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#1f6b3e] font-medium bg-[#e4f0e9] px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </div>
                <div className="text-xs text-[#4d5158] font-mono">
                  {fileSummary.formattedSize} · {fileSummary.rowCount} rows · {fileSummary.columnCount} columns
                </div>
              </div>
            </div>

            {/* Replace File Button */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setIsReplaceModalOpen(true)}
                className="dmiq-btn-secondary text-xs sm:text-sm py-2 px-3.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Replace file
              </button>
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="bg-white border border-[#e6e4df] rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-[#f4f3f0] border-b border-[#e6e4df] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4d5158]">
                <Table className="w-4 h-4" />
                Data Preview (First 5 of {fileSummary.rowCount} rows)
              </div>
              <div className="text-xs text-[#8a8f98]">
                {fileSummary.columnCount} detected columns
              </div>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs text-[#1a1c20] border-collapse">
                <thead className="bg-[#f4f3f0] text-[#4d5158] uppercase font-semibold text-[11px] border-b border-[#e6e4df] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-[#e6e4df] w-12 text-center bg-[#f4f3f0]">
                      #
                    </th>
                    {fileSummary.headers.map((header) => (
                      <th
                        key={header}
                        className="py-2.5 px-3 border-r border-[#e6e4df] font-medium whitespace-nowrap bg-[#f4f3f0]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e4df]">
                  {fileSummary.previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#f9f8f6] transition-colors">
                      <td className="py-2.5 px-3 border-r border-[#e6e4df] text-center font-mono text-[#8a8f98] bg-[#f9f8f6]">
                        {idx + 1}
                      </td>
                      {fileSummary.headers.map((header) => {
                        const cellVal = row[header];
                        const isEmpty = cellVal === undefined || cellVal === null || String(cellVal).trim() === '';

                        return (
                          <td
                            key={header}
                            className="py-2.5 px-3 border-r border-[#e6e4df] whitespace-nowrap"
                          >
                            {isEmpty ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#f4f3f0] text-[#8a8f98] font-mono">
                                Empty
                              </span>
                            ) : (
                              <span>{String(cellVal)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Progression Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#4d5158]">
              {fileSummary.rowCount} records loaded and ready for column mapping.
            </div>
            <button
              type="button"
              onClick={onProceedToMapping}
              className="dmiq-btn-primary px-6 py-2.5"
            >
              Continue to map fields
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Replace File Confirmation Modal */}
      {isReplaceModalOpen && (
        <div className="fixed inset-0 bg-[#1a1c20]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#e6e4df] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#faebd9] text-[#995c10] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#1a1c20]">
                  Replace uploaded file?
                </h3>
                <p className="text-xs text-[#4d5158] leading-relaxed">
                  Replacing the current file will discard any existing column mappings and address validations. Are you sure you want to proceed?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReplaceModalOpen(false)}
                className="dmiq-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReplaceModalOpen(false);
                  onResetFile();
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                className="dmiq-btn-primary bg-[#b22a2a] hover:bg-[#8f2121] text-xs"
              >
                Replace file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
