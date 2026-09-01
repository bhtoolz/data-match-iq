'use client';

import React from 'react';
import { UsageEvent } from '@/lib/types';
import { Zap, Activity, Clock } from 'lucide-react';

interface EventTickerProps {
  events: UsageEvent[];
  onEmitSample?: () => void;
}

export function EventTicker({ events, onEmitSample }: EventTickerProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Live Ingestion Stream</h3>
            <p className="text-[11px] text-slate-500">Real-time meter events</p>
          </div>
        </div>

        {onEmitSample && (
          <button
            onClick={onEmitSample}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
          >
            <Activity className="h-3 w-3 text-emerald-600" />
            <span>Emit Test</span>
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No events ingested yet.</div>
        ) : (
          events.slice(0, 6).map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs hover:border-slate-200 transition"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="font-mono font-medium text-slate-900">{evt.eventName}</span>
                <span className="text-[11px] text-slate-500 truncate max-w-[100px]">
                  {evt.customerName || evt.customerId}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700">
                  +{evt.value.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
