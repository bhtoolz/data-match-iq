# Data Match IQ — McGrath · AgentIQ

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Scoped_Tokens-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

> **Internal Australian property list normalisation, Agentbox contact matching, and call list export engine built for McGrath Real Estate (`McGrath · AgentIQ`).**

---

## 📌 Executive Summary

**Data Match IQ** is an internal productivity tool designed for McGrath staff (sales operations, data teams, agents). It transforms raw third-party property lists (CSV/Excel) into clean, normalised, and trustworthy call lists matched against **Agentbox CRM** contacts with explainable confidence scores and data-quality exception management.

### Key Objectives
- **Automate Address Normalisation**: Handle complex Australian sub-premises (`Unit 4/12`, `Lot 10`, `Shop 2`), street type standardisations (`Parade` → `Pde`, `Circuit` → `Cct`, `Highway` → `Hwy`), state checks, and postcode range validations.
- **Explainable Agentbox Matching**: Fuzzy Levenshtein and component-level matching scoring from 0–100% with transparent human-readable explanations (*e.g. "Exact unit and street match"*, *"Street type abbreviated in upload"*).
- **Interactive Exception Resolution**: Live status strips with batch actions (*"Accept suggested fixes"*, *"Exclude unparseable"*) and row-level inline editing.
- **Enterprise Calling List Exports**: One-click generation of sales-ready matched CSVs and complete audit CSVs.

---

## 🎨 Design System & PRD §13 Compliance

The application strictly adheres to the restrained McGrath corporate identity:
- **Canvas Background**: Warm light background (`#f9f8f6`)
- **Card Surface**: Crisp white (`#ffffff`)
- **Primary Ink**: Charcoal (`#1a1c20`)
- **McGrath Brand Accent**: Dark teal / navy (`#0f3d52`, hover `#0a2938`, soft `#e5ebf0`)
- **Operational Badges**: Ready Green (`#1f6b3e`), Review Amber (`#995c10`), Invalid Red (`#b22a2a`)
- **Zero AI-Slop**: No dark purple gradients, no glassmorphism, no emojis, no decorative charts.

---

## 🔄 3-Stage Guided Workflow

```
┌────────────────────────┐
│  Stage 1: Prepare Data │ ─── File Upload (CSV/XLSX up to 10MB) & 5-Row Preview
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Stage 1: Map Fields   │ ─── Smart Heuristic Auto-Mapping & Required Field Gating
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Stage 2: Check Issues │ ─── AU Address Normaliser, Postcode Validator & Exception Queue
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Stage 2: Async Match  │ ─── 4-Stage Agentbox CRM Matching Pipeline (Progress Bar & Cancel)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Stage 3: Results List │ ─── Filter Chips (Review required default), Search & Dual CSV Exports
└────────────────────────┘
```

---

## 🚀 Feature Breakdown

### 1. Stage 1 — Prepare Data & Upload (`/`)
- **Drag & Drop Ingestion**: Supports `.csv`, `.xlsx`, and `.xls` files up to 10 MB.
- **Data Preview Table**: Instant 5-row preview displaying all detected headers with explicit `Empty` cell chips.
- **Sample File Template**: Downloadable `mcgrath_property_sample.csv` template matching expected columns.
- **Quick Evaluation Loader**: 1-click test dataset loader with 22 Australian property campaign rows.

### 2. Stage 1 Sub-step — Smart Column Mapping (`/map-fields`)
- **Heuristic Auto-Mapping**: Automatically detects and suggests mapping for:
  - Required Fields: `External record ID`, `Suburb`, `State`, `Postcode`
  - Optional Address Components: `Street number`, `Street name`, `Street type`, `Unit number`, `Full address`
  - Metadata: `Source name`, `Notes`, `Ignore (do not import)`
- **Progression Gating**: Blocks progression and highlights missing fields until all 4 required fields are mapped.
- **Live Row 1 Address Preview**: Renders real-time parsed address output as mappings change.

### 3. Stage 2 — Check Issues & Australian Address Normaliser (`/validate`)
- **Australian Address Engine (`src/lib/australian-address-normalizer.ts`)**:
  - Over 40 standard Australian street types: `Pde`, `St`, `Rd`, `Ave`, `Cct`, `Cres`, `Hwy`, `Tce`, `Blvd`, `Esp`, `Dr`, `Ln`, `Pl`, `Ct`, `Cl`, etc.
  - State & Postcode Range Verification across all 8 states & territories:
    - **NSW**: `1000–1999`, `2000–2599`, `2619–2899`, `2921–2999`
    - **VIC**: `3000–3999`, `8000–8999`
    - **QLD**: `4000–4999`, `9000–9999`
    - **SA**: `5000–5799`, `5800–5999`
    - **WA**: `6000–6797`, `6800–6999`
    - **TAS**: `7000–7799`, `7800–7999`
    - **ACT**: `0200–0299`, `2600–2618`, `2900–2920`
    - **NT**: `0800–0899`, `0900–0999`
  - Sub-premise extractor (`Unit 4/12`, `U4 12`, `Suite 5`, `Lot 10`, `Shop 2`, `24-26`).
  - Duplicate detection across the uploaded dataset.
- **Reactive Exception Queue**:
  - Live metric strip: *Total rows, Ready, Warnings, Invalid, Duplicates, Excluded*.
  - Safe batch actions: *"Accept suggested fixes"* and *"Exclude unparseable"*.
  - Inline row fixes: *"Set to QLD"*, *"Add postcode"*, *"Keep duplicate"*, *"Exclude"*.
  - *"Export invalid CSV"* for reporting unresolvable errors.

### 4. Stage 2 Transient — Async Agentbox Matching Pipeline (`/match`)
- Simulates async background matching with live percentage, processed counter, and 4 sequential stages:
  1. *Preparing uploaded data*
  2. *Finding Agentbox candidates*
  3. *Comparing addresses*
  4. *Creating review results*
- Cancel match safety action that halts the job and returns to validation state without losing data.

### 5. Stage 3 — Results Call List & Exports (`/results`)
- **Outcome Summary Lead Card**: Shows total matched contacts ready to export and overall match rate.
- **Filter Chips**: Defaults to `Review required` per PRD §5.5, with instant toggles for `Matched`, `No match`, `Invalid`, and `View all`.
- **Full-Text Live Search**: Search by address, contact name, contact address, or external record ID.
- **Read-Only 3-Column Table**:
  1. *Uploaded address* (Row number, External ID badge, Raw address)
  2. *Matched Agentbox contact* (Contact name, Contact ID badge, Address)
  3. *Match assessment* (Status badge, Confidence label & score %, Confidence reason)
- **Slide-Over Detail Inspector Drawer**: Deep inspection of matched CRM records, phone, email, and agent attribution.
- **Dual CSV Export Engines**:
  - **Export matched contacts**: High-confidence calling list for sales reps.
  - **Export all results**: Complete audit spreadsheet with all scores and explanations.

---

## 📂 Codebase Structure

```
├── src/
│   ├── app/
│   │   ├── globals.css                       # McGrath design tokens & component classes
│   │   ├── layout.tsx                        # Global root layout & SEO metadata
│   │   └── page.tsx                          # Main stateful workflow controller
│   ├── components/
│   │   └── dmiq/
│   │       ├── Header.tsx                    # Brand header with McGrath badge & user avatar
│   │       ├── Stepper.tsx                   # 3-stage progress stepper
│   │       ├── UploadView.tsx                # Drag & drop upload, sample download, preview
│   │       ├── MapFieldsView.tsx             # Column mapping & required field gating
│   │       ├── ValidateView.tsx              # AU address normaliser & exception queue
│   │       ├── MatchProcessingView.tsx       # 4-stage async match progress simulation
│   │       └── ResultsView.tsx               # Results table, filters, drawer, dual exports
│   ├── lib/
│   │   ├── australian-address-normalizer.ts  # AU street types, state & postcode validation
│   │   ├── agentbox-matcher.ts               # Levenshtein matcher & confidence scoring engine
│   │   └── sample-datasets.ts                # McGrath property demo datasets & template CSV
│   └── types/
│       └── data-match-iq.ts                  # Comprehensive TypeScript definitions
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Local Development & Installation

### Prerequisites
- Node.js 18+ (Node 20 or 24 recommended)
- npm or pnpm

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/bhtoolz/data-match-iq.git
cd data-match-iq

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser
# http://localhost:3000 (or http://localhost:3005)
```

### Production Build
```bash
npm run build
npm run start
```

---

## 🌐 Deployment to Vercel

This repository is optimized for zero-config deployment on Vercel:
1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import this repository and click **Deploy**.
4. Your live working URL will be available immediately!

---

## 📄 License & Ownership
Created for **McGrath Real Estate** (`McGrath · AgentIQ`). All rights reserved.
