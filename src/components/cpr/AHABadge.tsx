import React from 'react';

export function AHABadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-3 bg-white/90 px-4 py-2 rounded-lg border border-slate-200 shadow-xs ${className}`}>
      {/* AHA Red Heart Torch Icon */}
      <svg
        viewBox="0 0 48 48"
        className="w-10 h-10 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 42 C12 32 4 23 4 14 C4 8 8 4 14 4 C18.5 4 22.2 6.8 24 10.5 C25.8 6.8 29.5 4 34 4 C40 4 44 8 44 14 C44 23 36 32 24 42 Z"
          fill="#dc2626"
        />
        {/* Flame / Torch */}
        <path
          d="M24 12 C24 12 21 17 21 21 C21 23.5 22.3 25.5 24 25.5 C25.7 25.5 27 23.5 27 21 C27 17 24 12 24 12 Z"
          fill="#ffffff"
        />
        <rect x="23" y="25" width="2" height="7" fill="#ffffff" rx="1" />
      </svg>

      <div className="flex items-center gap-2.5 text-left">
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-bold text-slate-900 tracking-tight">
            American Heart
          </span>
          <span className="text-[12px] font-bold text-slate-900 tracking-tight">
            Association<span className="text-red-600">®</span>
          </span>
        </div>

        <div className="h-7 w-[1.5px] bg-slate-300 mx-0.5" />

        <div className="flex flex-col leading-none">
          <span className="text-[11px] font-black uppercase text-red-600 tracking-wider">
            AUTHORIZED
          </span>
          <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider mt-0.5">
            TRAINING CENTER
          </span>
        </div>
      </div>
    </div>
  );
}
