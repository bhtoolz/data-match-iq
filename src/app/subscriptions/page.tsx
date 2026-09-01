'use client';

import React, { useState, useEffect } from 'react';
import { Repeat, Calculator } from 'lucide-react';
import { Subscription, Plan } from '@/lib/types';
import { ProrationCalculator } from '@/lib/proration';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isProrationOpen, setIsProrationOpen] = useState(false);
  const [calcResult, setCalcResult] = useState<any>(null);

  const [fromPrice, setFromPrice] = useState(2900);
  const [toPrice, setToPrice] = useState(9900);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/v1/subscriptions');
      const data = await res.json();
      setSubscriptions(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    const start = new Date();
    start.setDate(start.getDate() - 10);
    const end = new Date();
    end.setDate(end.getDate() + 20);

    const result = ProrationCalculator.calculate({
      currentPlanAmountCents: fromPrice,
      newPlanAmountCents: toPrice,
      periodStart: start,
      periodEnd: end,
    });
    setCalcResult(result);
  }, [fromPrice, toPrice]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Subscriptions</h1>
        </div>

        <button
          onClick={() => setIsProrationOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <Calculator className="h-3.5 w-3.5 text-indigo-600" />
          <span>Proration Calculator</span>
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium text-center">Seats</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium text-right">Renewal Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{sub.customer?.name || 'Customer'}</div>
                  <div className="text-[11px] text-slate-500">{sub.customer?.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                    {sub.priceId}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-mono font-medium text-slate-900">
                  {sub.quantity} Seats
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      sub.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sub.status === 'past_due'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-500">
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Proration Calculator Modal */}
      {isProrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Proration Math Calculator</h2>
              <button
                onClick={() => setIsProrationOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Current Plan</label>
                <select
                  value={fromPrice}
                  onChange={(e) => setFromPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono"
                >
                  <option value={2900}>Starter ($29.00/mo)</option>
                  <option value={9900}>Pro ($99.00/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Upgrade Plan</label>
                <select
                  value={toPrice}
                  onChange={(e) => setToPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono"
                >
                  <option value={9900}>Pro ($99.00/mo)</option>
                  <option value={49900}>Enterprise ($499.00/mo)</option>
                </select>
              </div>
            </div>

            {calcResult && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Unused Credit:</span>
                  <span className="text-emerald-600">-${(calcResult.unusedCurrentPlanCreditCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Prorated Charge:</span>
                  <span className="text-slate-900">+${(calcResult.proratedNewPlanChargeCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-sm">
                  <span>Net Due Today:</span>
                  <span className="text-indigo-600">${(calcResult.netAdjustmentCents / 100).toFixed(2)}</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500 font-sans">{calcResult.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
