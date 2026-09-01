'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { CommandPalette } from '@/components/command-palette';
import { EnvironmentProvider, useEnvironment } from '@/context/environment-context';

function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { isLiveMode, toggleEnvironment, setEnvironment } = useEnvironment();

  // Standalone mode for the CPR Certify Landing Page
  if (pathname === '/' || pathname === '/cpr-certify' || pathname?.startsWith('/verify')) {
    return <main className="min-h-screen bg-white text-slate-900">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navigation
        onOpenCommand={() => setIsCommandOpen(true)}
        isLiveMode={isLiveMode}
        onToggleMode={toggleEnvironment}
      />
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Stripe-style Test Mode Banner */}
      {!isLiveMode && (
        <div className="lg:ml-64 bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-xs font-semibold text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Viewing test data</span>
            <span className="font-normal text-[11px] text-amber-700 hidden sm:inline">
              • Test charges and simulated meter events only. No real payments are processed.
            </span>
          </div>
          <button
            onClick={() => setEnvironment(true)}
            className="text-[11px] font-bold text-amber-900 underline hover:no-underline cursor-pointer"
          >
            Switch to live
          </button>
        </div>
      )}

      {/* Content wrapper with fixed margin preventing any overlap with sidebar */}
      <main className="lg:ml-64 flex-1 min-h-[calc(100vh-3.5rem)] p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <EnvironmentProvider>
      <InnerLayout>{children}</InnerLayout>
    </EnvironmentProvider>
  );
}
