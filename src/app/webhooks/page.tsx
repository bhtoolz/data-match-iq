'use client';

import React, { useState, useEffect } from 'react';
import { Webhook, Send } from 'lucide-react';
import { WebhookDelivery, WebhookEndpoint } from '@/lib/types';

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [selectedEventType, setSelectedEventType] = useState('invoice.paid');
  const [targetUrl, setTargetUrl] = useState('https://api.hyperai.io/webhooks/stripoo');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/v1/webhooks');
      const data = await res.json();
      setEndpoints(data.endpoints || []);
      setDeliveries(data.recent_deliveries || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const res = await fetch('/api/v1/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: selectedEventType,
          target_url: targetUrl,
        }),
      });
      const data = await res.json();
      setLastResult(data.delivery);
      fetchWebhooks();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Webhooks</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Simulator Column */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">
            Dispatch Test Webhook
          </h2>

          <form onSubmit={handleSimulateWebhook} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Event Type</label>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono"
              >
                <option value="invoice.paid">invoice.paid</option>
                <option value="invoice.created">invoice.created</option>
                <option value="subscription.updated">subscription.updated</option>
                <option value="usage.threshold_exceeded">usage.threshold_exceeded</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Destination URL</label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSimulating ? 'Sending...' : 'Dispatch Event'}</span>
            </button>
          </form>

          {lastResult && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Status: 200 OK</span>
                <span>{lastResult.latencyMs}ms</span>
              </div>
              <div className="text-slate-400 break-all text-[10px]">
                <span className="text-slate-600 font-bold block">Stripoo-Signature:</span>
                {lastResult.signature}
              </div>
            </div>
          )}
        </div>

        {/* Deliveries Log Column */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Recent Deliveries
            </h2>
            <span className="font-mono text-xs text-slate-400">{deliveries.length} total</span>
          </div>

          <div className="mt-4 space-y-2">
            {deliveries.map((del) => (
              <div
                key={del.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <div className="font-mono font-bold text-slate-900">{del.eventType}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs">{del.signature}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    200 OK ({del.latencyMs || 42}ms)
                  </span>
                  <span className="text-[11px] text-slate-400">{new Date(del.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
