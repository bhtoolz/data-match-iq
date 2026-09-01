'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Gauge, Send, Database, Clock, Layers } from 'lucide-react';
import { UsageEvent } from '@/lib/types';

export default function UsageMeteringPage() {
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [selectedEventName, setSelectedEventName] = useState('api_requests');
  const [eventValue, setEventValue] = useState(2500);
  const [customerId, setCustomerId] = useState('cus_01HX89A');
  const [latency, setLatency] = useState<number | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/v1/events');
      const data = await res.json();
      setEvents(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSendEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIngesting(true);
    const start = performance.now();
    try {
      await fetch('/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          eventName: selectedEventName,
          value: Number(eventValue),
          properties: { environment: 'production', region: 'us-east-1' },
        }),
      });
      setLatency(Math.round(performance.now() - start));
      fetchEvents();
    } catch (e) {
      console.error(e);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Usage & Metering</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time meter records, unit rating, and consumption rollups</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Simulator Column */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Gauge className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Record Consumption Event</h2>
          </div>

          <form onSubmit={handleSendEvent} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-medium">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono"
              >
                <option value="cus_01HX89A">HyperAI Technologies</option>
                <option value="cus_01HX89D">Zenith Vector AI</option>
                <option value="cus_01HX89B">Vortex Labs</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-medium">Meter Definition</label>
              <select
                value={selectedEventName}
                onChange={(e) => setSelectedEventName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono"
              >
                <option value="api_requests">api_requests (API Requests)</option>
                <option value="compute_seconds">compute_seconds (Compute Duration)</option>
                <option value="storage_gb_hours">storage_gb_hours (Active Storage)</option>
                <option value="bandwidth_mb">bandwidth_mb (Egress Transfer)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-medium">Quantity (Units)</label>
              <input
                type="number"
                min="1"
                required
                value={eventValue}
                onChange={(e) => setEventValue(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isIngesting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isIngesting ? 'Recording...' : 'Record Event'}</span>
            </button>

            {latency !== null && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 font-mono text-[11px] text-emerald-700 flex items-center justify-between">
                <span>Ingested (202 Accepted):</span>
                <span className="font-bold">{latency}ms</span>
              </div>
            )}
          </form>
        </div>

        {/* Stream Column */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Consumption Log</h2>
            <span className="text-xs font-mono text-slate-400">{events.length} records</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500">
                <tr>
                  <th className="px-3.5 py-2.5 font-medium">Meter Event</th>
                  <th className="px-3.5 py-2.5 font-medium">Customer</th>
                  <th className="px-3.5 py-2.5 font-medium text-right">Units</th>
                  <th className="px-3.5 py-2.5 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-3.5 py-2.5 font-mono font-medium text-slate-900">{evt.eventName}</td>
                    <td className="px-3.5 py-2.5 text-slate-600">{evt.customerName || evt.customerId}</td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-indigo-600">
                      +{evt.value.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-400 text-[11px]">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
