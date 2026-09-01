'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download, CheckCircle2 } from 'lucide-react';
import { InvoiceModal } from '@/components/invoice-modal';
import { Invoice } from '@/lib/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/v1/invoices');
      const data = await res.json();
      setInvoices(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, action: 'pay' }),
      });
      if (res.ok) {
        setSelectedInvoice(null);
        fetchInvoices();
        showToast('Invoice settled and booked to ledger');
      } else {
        showToast('Failed to settle invoice');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error settling invoice');
    }
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer?.name && inv.customer.name.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    const headers = ['Invoice Number,Customer,Amount,Status,Due Date,Created At\n'];
    const rows = invoices.map((inv) =>
      [
        inv.invoiceNumber,
        `"${inv.customer?.name || 'Customer'}"`,
        (inv.totalCents / 100).toFixed(2),
        inv.status,
        inv.dueDate,
        inv.createdAt,
      ].join(',')
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stripoo_invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Invoices</h1>
          <p className="text-xs text-slate-500 mt-1">Customer invoices, payment terms, and status tracking</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 max-w-md shadow-2xs">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Filter invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium text-right">Subtotal</th>
              <th className="px-4 py-3 font-medium text-right">Discount</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{inv.customer?.name || 'Customer'}</div>
                  <div className="text-[11px] text-slate-500">{inv.customer?.email}</div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">
                  ${(inv.subtotalCents / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-emerald-600">
                  {inv.discountCents > 0 ? `-$${(inv.discountCents / 100).toFixed(2)}` : '$0.00'}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                  ${(inv.totalCents / 100).toFixed(2)} {inv.currency}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                  >
                    View PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onPay={handlePayInvoice}
      />
    </div>
  );
}
