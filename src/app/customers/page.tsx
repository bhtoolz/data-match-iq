'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  CreditCard,
  Wallet,
  Search,
  Download,
  X,
  CheckCircle2,
  Receipt,
  Repeat,
  Gauge,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Customer } from '@/lib/types';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/v1/customers');
      const data = await res.json();
      setCustomers(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setLoading(true);
    try {
      await fetch('/api/v1/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, name: newName }),
      });
      setNewEmail('');
      setNewName('');
      setIsCreateOpen(false);
      fetchCustomers();
      showToast('Customer created successfully');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Customer ID,Name,Email,Balance,Currency,Payment Method,Created At\n'];
    const rows = customers.map((c) =>
      [
        c.id,
        `"${c.name || ''}"`,
        c.email,
        (c.balanceCents / 100).toFixed(2),
        c.currency,
        c.paymentMethodId || 'pm_card_visa_4242',
        c.createdAt,
      ].join(',')
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stripoo_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported customers CSV');
  };

  const handleAddCredit = async (customer: Customer) => {
    try {
      const res = await fetch('/api/v1/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_balance',
          customerId: customer.id,
          deltaCents: 5000,
        }),
      });
      if (res.ok) {
        customer.balanceCents += 5000;
        setSelectedCustomer({ ...customer });
        fetchCustomers();
        showToast(`Added $50.00 credit to ${customer.name} and posted to ledger`);
      } else {
        showToast('Failed to adjust credit');
      }
    } catch (e) {
      showToast('Network error adding credit');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Customers</h1>
          <p className="text-xs text-slate-500 mt-1">Directory of client accounts, billing profiles, and balances</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 max-w-md shadow-2xs">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Filter by name, email, or customer ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Available Balance</th>
              <th className="px-4 py-3 font-medium">Payment Method</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className="hover:bg-slate-50/80 transition cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{c.name || 'Unnamed'}</div>
                  <div className="text-[11px] font-mono text-slate-400">{c.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.email}</td>
                <td className="px-4 py-3 font-mono font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <Wallet className="h-3 w-3" />
                    ${(c.balanceCents / 100).toFixed(2)} {c.currency}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                    Visa •••• 4242
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomer(c);
                    }}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-100 transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Customer Profile Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="h-full w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 space-y-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700">
                  {selectedCustomer.id}
                </span>
                <h2 className="mt-2 text-lg font-bold text-slate-900">{selectedCustomer.name}</h2>
                <p className="text-xs text-slate-500">{selectedCustomer.email}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Balances & Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-[11px] text-slate-500 font-medium">Customer Balance</div>
                <div className="mt-1 text-lg font-bold text-emerald-600 font-mono">
                  ${(selectedCustomer.balanceCents / 100).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">Available credit</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-[11px] text-slate-500 font-medium">Status</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Good Standing</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Auto-debit active</div>
              </div>
            </div>

            {/* Active Subscription */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Repeat className="h-4 w-4 text-indigo-600" />
                  Active Plan
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600 font-medium">Scale Tier Subscription</span>
                <span className="font-mono font-bold text-slate-900">$199.00 / month</span>
              </div>
              <div className="text-[11px] text-slate-400">Renews on September 1, 2026</div>
            </div>

            {/* Stored Payment Method */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-slate-600" />
                  Default Payment Method
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  Default
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs text-slate-700">
                <span className="font-bold uppercase">Visa</span>
                <span>•••• 4242</span>
                <span className="text-slate-400 ml-auto">Expires 12/28</span>
              </div>
            </div>

            {/* Metered Consumption */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-indigo-600" />
                  Cycle Consumption
                </span>
                <span className="font-mono text-xs font-bold text-indigo-600">18,420 units</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Aggregated via sliding window SLA (&lt;15ms ingestion latency).
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleAddCredit(selectedCustomer)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Add $50.00 Account Credit</span>
              </button>

              <Link
                href="/invoices"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs cursor-pointer"
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Create Invoice for Customer</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Customer</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Customer / Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Billing Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="billing@acme.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700 transition cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
