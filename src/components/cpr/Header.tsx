'use client';

import React from 'react';
import { CPRLogo } from './CPRLogo';
import { TaxExemptChoice } from '@/types/cpr';

interface HeaderProps {
  taxChoice: TaxExemptChoice;
  onOpenTaxModal: () => void;
}

export function Header({ taxChoice, onOpenTaxModal }: HeaderProps) {
  return (
    <header className="w-full">
      {/* Top Teal Horizontal Bar */}
      <div className="w-full bg-[#22b3c6] h-16 flex items-center justify-center relative shadow-xs">
        <CPRLogo size={54} className="translate-y-2.5 z-10" />
      </div>

      {/* Sub-Header Navigation: < Back | Tax Exempt */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <div className="flex items-center justify-center sm:justify-start">
          <button
            onClick={onOpenTaxModal}
            className="inline-flex items-center gap-1 text-[15px] font-semibold text-cyan-900 hover:text-cyan-950 transition-colors group cursor-pointer"
          >
            <span className="text-cyan-800 font-bold group-hover:-translate-x-0.5 transition-transform">
              &lt;
            </span>
            <span>Back | Tax Exempt</span>
            {taxChoice && (
              <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                {taxChoice === 'yes' ? 'Tax Exempt' : 'Non-Tax'}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
