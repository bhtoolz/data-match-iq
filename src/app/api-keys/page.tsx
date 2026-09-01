'use client';

import React, { useState } from 'react';
import { KeyRound, Copy, Check, AlertTriangle, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ApiKeysPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const keys = [
    {
      id: 'key_live_sec',
      name: 'Secret key',
      type: 'Server-side API requests (full administrative authorization)',
      key: 'sk_live_9b82a3c749e1e2f8a847b2c918374921',
      env: 'Live',
      isSecret: true,
    },
    {
      id: 'key_live_pub',
      name: 'Publishable key',
      type: 'Client-side SDKs & payment form tokenization',
      key: 'pk_live_449281a8b7c3d2e1903482716a5b4c3d',
      env: 'Live',
      isSecret: false,
    },
    {
      id: 'key_test_sec',
      name: 'Test secret key',
      type: 'Sandbox integration & unit testing simulator',
      key: 'sk_test_51Mz89Abc912093481283748291029384',
      env: 'Test',
      isSecret: true,
    },
  ];

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    showToast('API key copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string, isSecret: boolean, isRevealed: boolean) => {
    if (!isSecret || isRevealed) return key;
    const prefix = key.slice(0, 8);
    const suffix = key.slice(-4);
    return `${prefix}••••••••••••••••••••••••${suffix}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">API Keys</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authenticate REST API requests using standard Bearer token authorization
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <div className="space-y-0.5">
          <span className="font-bold">PCI-DSS Security Notice:</span>
          <p className="text-amber-800 text-[11px]">
            Never expose secret keys (<code className="font-mono font-bold">sk_live_...</code>) in client-side code, mobile apps, or public GitHub repositories.
            Secret keys have full account privileges to capture charges, issue refunds, and adjust customer balances.
          </p>
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        {keys.map((k) => {
          const isRevealed = !!revealedKeys[k.id];
          return (
            <div key={k.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{k.name}</h3>
                  <p className="text-xs text-slate-500 font-sans">{k.type}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    k.env === 'Live'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {k.env}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-mono text-xs text-slate-700 truncate select-all">
                  {maskKey(k.key, k.isSecret, isRevealed)}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  {k.isSecret && (
                    <button
                      onClick={() => toggleReveal(k.id)}
                      className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
                      title={isRevealed ? 'Hide key' : 'Reveal key'}
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Reveal</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(k.key, k.id)}
                    className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
                  >
                    {copiedKey === k.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
