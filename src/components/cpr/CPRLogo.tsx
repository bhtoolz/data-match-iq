import React from 'react';

interface CPRLogoProps {
  size?: number;
  className?: string;
}

export function CPRLogo({ size = 52, className = '' }: CPRLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-white shadow-md border-2 border-white overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Cyan Ring */}
        <circle cx="50" cy="50" r="46" stroke="#22b3c6" strokeWidth="4" fill="#ffffff" />
        
        {/* Red Triangle / Cross Heart graphic */}
        <path
          d="M50 18 L76 76 L24 76 Z"
          stroke="#e11d48"
          strokeWidth="3"
          fill="none"
          strokeLinejoin="round"
        />
        
        {/* Stylized Human Figure / Lifesaver */}
        {/* Head */}
        <circle cx="50" cy="38" r="8" fill="#1e293b" />
        {/* Body & outstretched CPR hands */}
        <path
          d="M34 68 C36 52 44 48 50 48 C56 48 64 52 66 68 Z"
          fill="#1e293b"
        />
        {/* Red ECG / Pulse line */}
        <path
          d="M30 58 L42 58 L46 50 L52 64 L56 56 L60 60 L70 60"
          stroke="#e11d48"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
