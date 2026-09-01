'use client';

import React, { useState, useEffect } from 'react';
import { TaxExemptChoice } from '@/types/cpr';

interface TaxExemptModalProps {
  isOpen: boolean;
  currentChoice: TaxExemptChoice;
  onConfirm: (choice: 'yes' | 'no') => void;
  canDismiss?: boolean;
  onClose?: () => void;
}

export function TaxExemptModal({
  isOpen,
  currentChoice,
  onConfirm,
  canDismiss = false,
  onClose,
}: TaxExemptModalProps) {
  const [selected, setSelected] = useState<'yes' | 'no'>(currentChoice || 'yes');

  useEffect(() => {
    if (currentChoice) {
      setSelected(currentChoice);
    }
  }, [currentChoice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100 transition-all transform"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Body */}
          <div className="p-8 sm:p-10 space-y-6">
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-slate-800 leading-snug">
              Are you Tax Exempt?{' '}
              <span className="text-slate-600 font-normal">
                (The CPR Pro has my tax exempt documents on file.)
              </span>
            </h2>

            {/* Radio Options */}
            <div className="space-y-4 pt-1">
              <label className="flex items-center gap-3.5 cursor-pointer group select-none">
                <input
                  type="radio"
                  name="tax_exempt_option"
                  value="yes"
                  checked={selected === 'yes'}
                  onChange={() => setSelected('yes')}
                  className="w-5 h-5 text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer accent-[#22b3c6]"
                />
                <span className="text-[16px] text-slate-800 font-medium group-hover:text-slate-950 transition-colors">
                  Yes
                </span>
              </label>

              <label className="flex items-center gap-3.5 cursor-pointer group select-none">
                <input
                  type="radio"
                  name="tax_exempt_option"
                  value="no"
                  checked={selected === 'no'}
                  onChange={() => setSelected('no')}
                  className="w-5 h-5 text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer accent-[#22b3c6]"
                />
                <span className="text-[16px] text-slate-800 font-medium group-hover:text-slate-950 transition-colors">
                  No
                </span>
              </label>
            </div>
          </div>

          {/* Bottom Teal Banner with SUBMIT button matching Screenshot 1 */}
          <div className="bg-[#22b3c6] px-6 py-3.5 flex items-center justify-end">
            <button
              type="submit"
              className="px-8 py-2 text-[15px] font-bold text-white uppercase tracking-wider hover:bg-black/10 active:bg-black/20 rounded transition-colors cursor-pointer"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
