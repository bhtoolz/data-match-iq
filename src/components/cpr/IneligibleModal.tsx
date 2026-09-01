'use client';

import React from 'react';
import { AlertCircle, X, HelpCircle, RefreshCw } from 'lucide-react';

interface IneligibleModalProps {
  isOpen: boolean;
  searchedName: string;
  reason?: 'not_found' | 'inactive';
  onClose: () => void;
  onRetry: () => void;
}

export function IneligibleModal({
  isOpen,
  searchedName,
  reason = 'not_found',
  onClose,
  onRetry,
}: IneligibleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100">
        {/* Header */}
        <div className="bg-red-50 p-6 border-b border-red-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-950">
                You Are Not Eligible
              </h3>
              <p className="text-xs text-red-700 font-medium mt-0.5">
                Instructor Authorization Required
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-white/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-700 text-sm leading-relaxed">
            Sorry, we could not verify an active authorization for:
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <span className="font-semibold text-slate-900 text-sm">
              {searchedName || 'Unknown Instructor'}
            </span>
            <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-700">
              {reason === 'inactive' ? 'Status: Inactive' : 'Not Found in Directory'}
            </span>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">
            According to TheCPRPro training records, only certified instructors with an{' '}
            <strong className="text-slate-800">Active</strong> status in the instructor database are
            authorized to purchase eCards.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex gap-2.5 items-start">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Please ensure your name is spelled exactly as registered with TheCPRPro, or contact
              your Training Site Coordinator to renew your active status.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Edit Information
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
