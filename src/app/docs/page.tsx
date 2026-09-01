'use client';

import React, { useState } from 'react';
import { FileText, Layers, Database, ShieldCheck } from 'lucide-react';

export default function DocsViewerPage() {
  const [activeTab, setActiveTab] = useState('prd');

  const docs = {
    prd: {
      title: '01 - Business & Product Requirements (PRD)',
      icon: FileText,
      content: `
# Executive Vision & Core Value Proposition
Stripoo is a self-hostable, developer-first billing engine that bridges traditional subscription management with real-time usage-based event ingestion and Stripe-grade developer experience.

## Key Stakeholder Solutions:
- **AI & SaaS Founders:** Hybrid monetization (Base Subscriptions + AI Token Metering + Seat Scaling).
- **Backend Engineers:** Sub-15ms event ingestion, idempotent API pipelines, and HMAC-signed webhooks.
- **Finance Ops:** Mathematical double-entry ledger balance proofs and compliant PDF invoices.
      `,
    },
    arch: {
      title: '03 - System Architecture & State Machine',
      icon: Layers,
      content: `
# System Invariants & Pipeline

1. **Ingestion SLA:** <15ms p95 latency via sliding-window event aggregation.
2. **Double-Entry Ledger Invariant:** Sum(Debits) - Sum(Credits) === 0.
3. **Idempotency Guarantee:** Cryptographic SHA-256 lock-and-replay architecture ensuring 0.00% double-charge risk.
4. **Subscription State Transitions:**
   trialing -> active -> past_due (3 dunning retries) -> canceled / paused.
      `,
    },
    db: {
      title: '04 - Database Schema & Data Dictionary',
      icon: Database,
      content: `
# Multi-Tenant Relational Schema (PostgreSQL)

- **workspaces:** Multi-tenant root isolation and signing keys.
- **customers:** Billing profiles, email, and prepaid balance in integer cents.
- **subscriptions:** Active plans, seat multipliers, and proration boundaries.
- **usage_events:** High-throughput micro-meter store with deduplication hash.
- **invoices & invoice_items:** Itemized records, tax rates, and printable PDF URL.
- **ledger_accounts & ledger_entries:** Immutable double-entry accounting records.
      `,
    },
    sec: {
      title: '07 - Financial Security & Compliance',
      icon: ShieldCheck,
      content: `
# Compliance & Defense-in-Depth

- **Zero-Double-Charge Invariant:** Mandatory Idempotency-Key headers with atomic locks.
- **HMAC-SHA256 Signatures:** Stripoo-Signature timestamped payload verification.
- **PCI-DSS SAQ-A Scope Reduction:** Raw PANs/CVVs are never handled on server infrastructure.
      `,
    },
  };

  const currentDoc = docs[activeTab as keyof typeof docs];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Documentation</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {Object.entries(docs).map(([key, item]) => {
          const Icon = item.icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Doc Viewer Content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 font-mono">{currentDoc.title}</h2>
        <div className="mt-4 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
          {currentDoc.content}
        </div>
      </div>
    </div>
  );
}
