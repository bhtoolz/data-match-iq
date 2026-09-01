'use client';

import React, { useState } from 'react';
import { InstructorRecord } from '@/types/cpr';
import { FileSpreadsheet, X, Check, Globe, RefreshCw, Database } from 'lucide-react';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSheetUrl: string;
  onSaveSheetUrl: (url: string) => void;
  instructors: InstructorRecord[];
  onResetDefault: () => void;
}

export function SheetSettingsModal({
  isOpen,
  onClose,
  currentSheetUrl,
  onSaveSheetUrl,
  instructors,
  onResetDefault,
}: SheetSettingsModalProps) {
  const [urlInput, setUrlInput] = useState(currentSheetUrl);
  const [activeTab, setActiveTab] = useState<'url' | 'data'>('url');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSheetUrl(urlInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Excel / Google Sheet Data Source</h3>
              <p className="text-xs text-slate-400">
                Connect live sheet link or inspect loaded instructor authorizations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            Google Sheet Link
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'data'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Current Directory ({instructors.length} Instructors)
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'url' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Google Sheet or CSV URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  You can paste your Google Sheet publish link (File → Share → Publish to web → CSV)
                  or direct spreadsheet link. Whenever the link is provided, it will automatically sync.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Currently using sample data from your screenshot: <strong>Aaron McDonald</strong> (Active, 5 cards authorized) &amp; <strong>Alicia Moore</strong> (Active, BLS only).
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('');
                    onResetDefault();
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset to Default Sample Data
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                  >
                    Save &amp; Connect
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="max-h-64 overflow-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="p-2.5 font-bold">Instructor Name</th>
                      <th className="p-2.5 font-bold">Status</th>
                      <th className="p-2.5 font-bold text-center">Authorized Cards</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((ins, idx) => {
                      const authorizedList = Object.entries(ins.authorizedCards)
                        .filter(([_, authorized]) => authorized)
                        .map(([code]) => code);

                      return (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="p-2.5 font-semibold text-slate-900">{ins.name}</td>
                          <td className="p-2.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ins.status.toLowerCase() === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {ins.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="text-[11px] font-medium text-slate-600">
                              {authorizedList.length > 0
                                ? authorizedList.join(', ')
                                : 'None'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-right pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
