'use client';

import React from 'react';
import { CPRLogo } from './CPRLogo';

export function Footer() {
  return (
    <footer className="w-full mt-auto">
      {/* Bottom Teal Horizontal Bar */}
      <div className="w-full bg-[#22b3c6] py-6 px-4 flex flex-col items-center justify-center relative shadow-inner">
        {/* Centered Circular Logo */}
        <div className="mb-3">
          <CPRLogo size={46} />
        </div>

        {/* Legal Links & Copyright */}
        <div className="text-center text-[12px] sm:text-[13px] text-white/95 font-medium tracking-wide">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>2024 © TheCPRPro</span>
            <span className="text-white/60">|</span>
            <button
              onClick={() => alert('TheCPRPro Privacy Policy')}
              className="hover:underline hover:text-white cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-white/60">|</span>
            <button
              onClick={() => alert('TheCPRPro Earnings Disclaimer')}
              className="hover:underline hover:text-white cursor-pointer"
            >
              Earnings Disclaimer
            </button>
            <span className="text-white/60">|</span>
            <button
              onClick={() => alert('TheCPRPro Refund Policy')}
              className="hover:underline hover:text-white cursor-pointer"
            >
              Refund Policy
            </button>
            <span className="text-white/60">|</span>
            <button
              onClick={() => alert('TheCPRPro Terms & Conditions')}
              className="hover:underline hover:text-white cursor-pointer"
            >
              Terms & Conditions
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
}
