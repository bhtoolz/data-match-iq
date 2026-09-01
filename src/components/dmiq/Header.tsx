'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  onResetWorkflow?: () => void;
  canReset?: boolean;
}

/**
 * Top global navigation bar for Data Match IQ.
 * Follows McGrath branding: "Data Match IQ", "McGrath · AgentIQ" tag, and "JL - J. Lee" user profile.
 */
export function Header({ onResetWorkflow, canReset }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-[#e6e4df]">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand & Organization Badge */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg sm:text-xl text-[#1a1c20] tracking-tight">
            Data Match IQ
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e5ebf0] text-[#0f3d52]">
            McGrath · AgentIQ
          </span>
        </div>

        {/* Right Section: Workflow Reset & Signed-in User */}
        <div className="flex items-center gap-4">
          {canReset && onResetWorkflow && (
            <button
              type="button"
              onClick={onResetWorkflow}
              className="dmiq-btn-text text-xs sm:text-sm py-1.5 px-3 flex items-center gap-1.5 text-[#4d5158] hover:text-[#1a1c20]"
              title="Reset workflow and upload a new file"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start new match</span>
            </button>
          )}

          {/* User Profile Avatar matching PRD & Prototype */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-full bg-[#e5ebf0] text-[#0f3d52] font-semibold text-xs flex items-center justify-center border border-[#d0cdc6]">
              JL
            </div>
            <span className="text-sm font-medium text-[#1a1c20] hidden sm:inline">
              J. Lee
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
