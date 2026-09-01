'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { Coupon } from '@/lib/types';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [code, setCode] = useState('');
  const [percentOff, setPercentOff] = useState(20);
  const [duration, setDuration] = useState<'once' | 'repeating' | 'forever'>('once');
  const [loading, setLoading] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/v1/coupons');
      const data = await res.json();
      setCoupons(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    try {
      await fetch('/api/v1/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          percentOff: Number(percentOff),
          duration,
        }),
      });
      setCode('');
      setIsCreateOpen(false);
      fetchCoupons();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Coupons</h1>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {coupons.map((cpn) => (
          <div key={cpn.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-600" />
                <span className="font-mono text-sm font-bold text-slate-900">{cpn.code}</span>
              </div>
              <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700">
                {cpn.percentOff ? `${cpn.percentOff}% OFF` : `$${((cpn.amountOffCents || 0) / 100).toFixed(2)} OFF`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Duration:</span>
              <span className="capitalize text-slate-900 font-medium">{cpn.duration}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Redemptions:</span>
              <span className="text-slate-900 font-medium">
                {cpn.redeemedCount} / {cpn.maxRedemptions || '∞'}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-mono">
              Valid until: {cpn.expiresAt ? new Date(cpn.expiresAt).toLocaleDateString() : 'No expiration'}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">Create Coupon</h2>

            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PROMO2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Percentage Discount (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={percentOff}
                  onChange={(e) => setPercentOff(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono"
                >
                  <option value="once">Once</option>
                  <option value="repeating">Repeating</option>
                  <option value="forever">Forever</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700"
                >
                  {loading ? 'Creating...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
