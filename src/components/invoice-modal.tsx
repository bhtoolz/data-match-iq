'use client';

import React from 'react';
import { Invoice } from '@/lib/types';
import { X, Printer, CheckCircle2, ShieldCheck, Download, Building2, CreditCard } from 'lucide-react';

interface InvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPay?: (invoiceId: string) => void;
}

export function InvoiceModal({ invoice, onClose, onPay }: InvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto print:block">
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl print:border-none print:shadow-none print:max-w-none print:my-0 print:rounded-none">
        
        {/* Screen-Only Controls Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-3.5 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 font-mono">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Official Tax Invoice Document Sheet */}
        <div className="p-8 sm:p-12 text-slate-800 space-y-8 bg-white print:p-0">
          
          {/* Header Block */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <img src="/icon.png" alt="Stripoo Logo" className="h-9 w-9 object-contain" />
                <span className="text-xl font-bold tracking-tight text-slate-900">Stripoo Inc.</span>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed font-sans">
                <p className="font-semibold text-slate-700">Stripoo Cloud & Financial Systems</p>
                <p>548 Market St, Suite 89201</p>
                <p>San Francisco, CA 94104, United States</p>
                <p className="font-mono text-[11px] mt-1">Tax ID: US-849201934 • billing@stripoo.dev</p>
              </div>
            </div>

            <div className="text-right space-y-1.5">
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">Invoice</h1>
              <div className="font-mono text-sm font-bold text-indigo-600">
                {invoice.invoiceNumber}
              </div>
              <div className="inline-block mt-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider font-mono ${
                    isPaid
                      ? 'bg-emerald-100/70 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100/70 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isPaid ? '✓ Paid' : '● Due'}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata & Billing Parties */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            {/* Billed To */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Billed To
              </div>
              <div className="font-bold text-sm text-slate-900">
                {invoice.customer?.name || 'HyperAI Technologies Inc.'}
              </div>
              <div className="text-slate-600 leading-relaxed">
                <p>{invoice.customer?.email || 'alex@hyperai.io'}</p>
                <p>100 AI Boulevard, Floor 4</p>
                <p>San Francisco, CA 94107, USA</p>
                <p className="font-mono text-[11px] text-slate-400 mt-1">Customer ID: {invoice.customerId}</p>
              </div>
            </div>

            {/* Invoice Details Table */}
            <div className="space-y-2 border-l border-slate-100 pl-8">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Invoice Details
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Invoice Date:</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Payment Due:</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {isPaid && (
                  <div className="flex justify-between py-0.5 text-emerald-700">
                    <span className="font-medium">Paid On:</span>
                    <span className="font-bold">
                      {new Date(invoice.paidAt || invoice.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-mono font-medium text-slate-700">Visa •••• 4242</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 text-center font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{item.description}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Service Period: Aug 1 – Aug 31, 2026</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                      ${(item.unitAmountCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900">
                      ${(item.totalAmountCents / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium">${(invoice.subtotalCents / 100).toFixed(2)}</span>
              </div>

              {invoice.discountCents > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Promotional Discount (20% Off)</span>
                  <span className="font-mono">-${(invoice.discountCents / 100).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Sales Tax / VAT (8.00%)</span>
                <span className="font-mono font-medium">${(invoice.taxCents / 100).toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total</span>
                <span className="font-mono text-base">${(invoice.totalCents / 100).toFixed(2)} USD</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600 pt-1">
                <span>Amount Paid</span>
                <span className="font-mono font-semibold text-emerald-600">
                  ${isPaid ? (invoice.totalCents / 100).toFixed(2) : '0.00'} USD
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between text-xs font-bold text-slate-900">
                <span>Balance Due</span>
                <span className="font-mono text-slate-900">
                  ${isPaid ? '0.00' : (invoice.totalCents / 100).toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>

          {/* Formal Legal Footer & Compliance Notes */}
          <div className="border-t border-slate-200 pt-6 space-y-3 text-xs text-slate-500">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>Audited Financial Record • Double-Entry Journal Entry Reconciled</span>
              </div>
              <div className="font-mono text-slate-400">Reference: tx_grp_{invoice.invoiceNumber.slice(-4)}</div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Thank you for your business. This is an electronic invoice generated by Stripoo Billing Engine.
              Questions regarding this invoice can be directed to billing@stripoo.dev or via your customer portal.
            </p>
          </div>

        </div>

        {/* Screen Action: Simulate Payment (if open) */}
        {invoice.status === 'open' && onPay && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end print:hidden">
            <button
              onClick={() => onPay(invoice.id)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Simulate Settlement (${(invoice.totalCents / 100).toFixed(2)} USD)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
