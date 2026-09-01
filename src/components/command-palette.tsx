'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Repeat,
  Gauge,
  FileText,
  Tag,
  Radio,
  Key,
  LayoutGrid,
  ArrowRight,
  X,
  Building2,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    { id: '1', label: 'Overview', href: '/', icon: LayoutGrid, category: 'Main' },
    { id: '12', label: 'Payments', href: '/payments', icon: FileText, category: 'Billing & Operations' },
    { id: '2', label: 'Invoices', href: '/invoices', icon: FileText, category: 'Billing & Operations' },
    { id: '3', label: 'Subscriptions', href: '/subscriptions', icon: Repeat, category: 'Billing & Operations' },
    { id: '4', label: 'Usage', href: '/usage', icon: Gauge, category: 'Billing & Operations' },
    { id: '5', label: 'Customers', href: '/customers', icon: Users, category: 'Billing & Operations' },
    { id: '6', label: 'Coupons', href: '/coupons', icon: Tag, category: 'Billing & Operations' },
    { id: '7', label: 'API Keys', href: '/api-keys', icon: Key, category: 'Developers' },
    { id: '8', label: 'Webhooks', href: '/webhooks', icon: Radio, category: 'Developers' },
    { id: '9', label: 'HyperAI Technologies (Customer)', href: '/customers', icon: Building2, category: 'Customers' },
    { id: '10', label: 'Zenith Vector AI (Customer)', href: '/customers', icon: Building2, category: 'Customers' },
    { id: '11', label: 'Invoice INV-2026-0042 ($283.72)', href: '/invoices', icon: FileText, category: 'Invoices' },
  ];

  const filtered = items.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        } else if (e.key === 'Enter' && filtered[selectedIndex]) {
          e.preventDefault();
          router.push(filtered[selectedIndex].href);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filtered, selectedIndex, router]);

  if (!isOpen) return null;

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-20 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input
            autoFocus
            type="text"
            placeholder="Search customers, invoices, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No results found for &quot;{query}&quot;</div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((action, index) => {
                const Icon = action.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleSelect(action.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition cursor-pointer ${
                      isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md border text-slate-500 shadow-2xs ${
                        isSelected ? 'bg-indigo-100/70 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div>{action.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{action.category}</div>
                      </div>
                    </div>
                    <ArrowRight className={`h-3.5 w-3.5 transition ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigate:</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] shadow-2xs">↑</kbd>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] shadow-2xs">↓</kbd>
          </div>
          <div className="flex items-center gap-2">
            <span>Select:</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] shadow-2xs">↵</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
