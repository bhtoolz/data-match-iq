'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Download,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Payment } from '@/lib/types';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'refunded'>('all');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Requested by customer');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/v1/payments');
      const data = await res.json();
      setPayments(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setIsSubmittingRefund(true);
    try {
      const res = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refund',
          paymentId: selectedPayment.id,
          reason: refundReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsRefundModalOpen(false);
        showToast(`Refund of $${(selectedPayment.amountCents / 100).toFixed(2)} processed`);
        fetchPayments();
      } else {
        showToast(data.error?.message || 'Failed to process refund');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error processing refund');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Payment ID,Amount,Currency,Status,Customer,Email,Payment Method,Receipt,Date\n'];
    const rows = payments.map((p) =>
      [
        p.id,
        (p.amountCents / 100).toFixed(2),
        p.currency,
        p.status,
        `"${p.customer?.name || 'Customer'}"`,
        p.customer?.email || '',
        `"${p.paymentMethod.brand.toUpperCase()} **** ${p.paymentMethod.last4}"`,
        p.receiptNumber,
        p.createdAt,
      ].join(',')
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stripoo_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported payments CSV');
  };

  const filtered = payments.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.customer?.name?.toLowerCase().includes(q) ||
        p.customer?.email?.toLowerCase().includes(q) ||
        p.receiptNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalVol = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((acc, p) => acc + p.amountCents, 0);

  const refundedVol = payments
    .filter((p) => p.status === 'refunded')
    .reduce((acc, p) => acc + (p.refundedAmountCents || p.amountCents), 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Payments</h1>
          <p className="text-xs text-slate-500 mt-1">Transaction authorizations, captured charges, and settlements</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Captured Volume</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ${(totalVol / 100).toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            {payments.filter((p) => p.status === 'succeeded').length} successful charges
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Refunded Volume</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ${(refundedVol / 100).toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            {payments.filter((p) => p.status === 'refunded').length} refunded charges
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Settlement Currency</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            USD ($)
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
            ● Direct clearing enabled
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        {/* Filters & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-[11px] font-medium text-slate-600">
            {(['all', 'succeeded', 'refunded'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded px-3 py-1 capitalize transition cursor-pointer ${
                  filter === tab ? 'bg-white font-semibold text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Payment Method</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Date</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    ${(p.amountCents / 100).toFixed(2)}
                    <span className="text-[10px] text-slate-400 ml-1 uppercase">{p.currency}</span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        p.status === 'succeeded'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          p.status === 'succeeded' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {p.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{p.customer?.name || 'Customer'}</div>
                    <div className="text-[11px] text-slate-500">{p.customer?.email}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-mono text-slate-700">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                      <span className="uppercase font-semibold">{p.paymentMethod.brand}</span>
                      <span>•••• {p.paymentMethod.last4}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{p.description}</td>

                  <td className="px-4 py-3 text-right font-mono text-slate-500 text-[11px]">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {p.status === 'succeeded' ? (
                      <button
                        onClick={() => {
                          setSelectedPayment(p);
                          setIsRefundModalOpen(true);
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                      >
                        Refund
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Refunded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {isRefundModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Refund Payment</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedPayment.id}</p>
              </div>
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRefund} className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-between items-center">
                <div>
                  <div className="text-slate-500">Refund Amount</div>
                  <div className="font-mono text-base font-bold text-slate-900">
                    ${(selectedPayment.amountCents / 100).toFixed(2)} USD
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  {selectedPayment.customer?.name}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason for Refund</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono"
                >
                  <option value="Requested by customer">Requested by customer</option>
                  <option value="Duplicate charge">Duplicate charge</option>
                  <option value="Fraudulent transaction">Fraudulent transaction</option>
                  <option value="Service canceled">Service canceled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRefund}
                  className="rounded-lg bg-rose-600 px-4 py-1.5 font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
                >
                  {isSubmittingRefund ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
