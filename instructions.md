# Tariff Insights — Product Requirements Document (Cursor‑ready)

> **One‑liner:** *A quiet, powerful web app that demystifies tariffs by turning global trade data into intuitive, interactive visuals.*

---

## Table of Contents

1. [Overview](#overview)
2. [Target Audience](#target-audience)
3. [Problem Statement](#problem-statement)
4. [Primary Use Case](#primary-use-case)
5. [Solution Overview](#solution-overview)
6. [Key Features](#key-features)

   * [Interactive World Map](#interactive-world-map)
   * [Data Visualization Dashboard](#data-visualization-dashboard)
   * [Tariff Scenario Simulator (Stretch)](#tariff-scenario-simulator-stretch)
   * [Explanatory Tooltips & Content](#explanatory-tooltips--content)
   * [Deployment & User Access](#deployment--user-access)
7. [Data Sources & Backend Details](#data-sources--backend-details)
8. [Tech Stack & Architecture](#tech-stack--architecture)
9. [Functional Requirements](#functional-requirements)
10. [Non‑Functional Requirements](#non-functional-requirements)
11. [Priorities & Roadmap](#priorities--roadmap)
12. [Cursor Development Guidelines](#cursor-development-guidelines)
13. [API Contracts (Draft)](#api-contracts-draft)
14. [Data Model (Draft)](#data-model-draft)
15. [Engineering Playbook](#engineering-playbook)
16. [Definition of Done & QA](#definition-of-done--qa)
17. [Demo Script (Hackathon)](#demo-script-hackathon)
18. [Glossary](#glossary)
19. [References](#references)

---

## Overview

Tariff Insights is an interactive web platform designed to educate the public about tariffs and their macroeconomic effects. The goal is a **simple, powerful, and quiet** product—free of noise and clutter—bridging the gap between bloated expert tools and shallow infographics. Users should move from curiosity to insight without spreadsheets or academic papers.

**Hackathon context:** The experience must make value obvious in a short demo while remaining genuinely useful to general audiences.

---

## Target Audience

* **General Public:** Students, professionals, and curious learners who want a clear picture of trade and tariffs without expert jargon.
* **Hackathon Judges/Stakeholders:** Evaluators who need to see creativity, impact, and technical execution quickly.

---

## Problem Statement

Tariffs (taxes on imports/exports) shape prices, jobs, and international relations, yet their effects are opaque to non‑experts. Existing solutions are:

* **Overly complex** (WTO/government portals) → powerful but hard to navigate.
* **Over‑simplified** (static news graphics) → easy to read but shallow.

**Gap:** A trustworthy, interactive, and accessible tool that explains *who* imposes tariffs on *whom*, *which* sectors are impacted, and *how* economies are affected.

---

## Primary Use Case

**Exploring a trade relationship (e.g., US ↔ China):**

1. User lands on a world map colored by tariff/trade metrics.
2. Selecting a country (or pair) reveals arrows showing bilateral trade, with tooltips for average tariff rates.
3. A **Sankey diagram** breaks flows by sector; line thickness = volume; color = tariff impact.
4. **KPIs** surface: total trade, average tariff rate, % traded tariff‑free, etc.
5. (Stretch) A **What‑If** slider adjusts a tariff (e.g., +5% on electronics) and recomputes indicative outcomes.
6. Short, plain‑language explanations ground each visualization.

**Outcome:** A non‑economist “gets it” in minutes.

---

## Solution Overview

**Front‑end:** Clean, interactive visuals (Mapbox + D3/Plotly) with linked views (map ↔ charts). Minimalist UI with Tailwind and accessible components (shadcn/ui).

**Back‑end:** FastAPI aggregates from reputable datasets (WITS, UN Comtrade, WTO). Server computes summary stats and (optionally) simple scenario deltas; front‑end remains responsive.

**Deployment:** Web‑first; Next.js on Vercel; FastAPI on a managed host (Railway/Fly.io/Render/Heroku). Data can be pre‑fetched and cached to keep request latency low.

---

## Key Features

### Interactive World Map

* **Heat Map:** Color countries by average tariff or trade restrictiveness index.
* **Trade Flow Arrows:** On country selection, show weighted edges to top partners (width = volume; hue = tariff level).
* **Hover/Click Details:** Tooltips for quick stats; click to pin and open side‑panel details.
* **Zoom & Pan:** Smooth navigation; Europe/Caribbean dense‑area legibility.

**Why it matters:** A fast, global sense of protectionism and major trade routes.

---

### Data Visualization Dashboard

* **Sankey (by sector):** Split bilateral flows by HS section/category to reveal sectoral drivers.
* **Network Graph (alt view):** Countries as nodes; edges weighted by volume/tariff for multilateral context.
* **KPI Charts:**

  * Tariff rates over time (line).
  * Trade volume/trade balance over time (line/bar).
  * Top X partners or goods (bar).
* **Dynamic Filtering:** Year, sector, tariff type (MFN vs. others). Linked highlighting across views.

**Why it matters:** Drill from macro picture to sector details with context.

---

### Tariff Scenario Simulator (Stretch)

* **What‑If:** Adjust a tariff (e.g., automobiles +10%).
* **Presets:** “Zero tariffs between A↔B” or “Across‑the‑board +5% in Z”.
* **Visual Deltas:** Red/green highlights; reduced Sankey widths.
* **Reset:** Clear differentiation between real data and hypothetical scenarios.

**Why it matters:** Turns passive info into active learning; great for demos.

---

### Explanatory Tooltips & Content

* **Plain‑language tooltips** (e.g., *“Weighted tariff: import‑weighted average duty rate”*).
* **Glossary pop‑ups** (MFN, HS code, import/export, etc.).
* **Captioned visuals** explaining what/why each chart shows.

**Why it matters:** Education and accessibility are core goals.

---

### Deployment & User Access

* **Web deployment**; no install required.
* **Responsive design** (desktop‑first; tablet OK; mobile read‑only minimal viable).
* **Performance:** On‑demand data loading; optimistic UI with loaders for heavier queries.
* **Hosting:** Next.js on Vercel; FastAPI container on Fly.io/Railway/Render/Heroku.

---

## Data Sources & Backend Details

* **Primary:** World Bank **WITS** (tariffs, indicators). *(Use downloaded extracts or cached API responses for speed.)*
* **Supplemental:** **UN Comtrade** (detailed bilateral trade values); **WTO** (tariff schedules/metadata).
* **Processing:** Python (**pandas**, **NumPy**) for aggregation and import‑weighted calculations.
* **Storage:** Start with cached JSON/CSV; scale to Postgres (Supabase) if needed.
* **Accuracy & Recency:** Clearly display **data year** (e.g., *“Data shown: 2022”*).

**Import‑weighted average tariff formula:**

```
weighted_tariff = (Σ_i (duty_rate_i × import_value_i)) / (Σ_i import_value_i)
```

---

## Tech Stack & Architecture

**Front‑End**

* **Next.js (React + TypeScript)**
* **Mapbox GL JS** for maps
* **D3.js** and/or **Plotly.js** for Sankey/network/KPIs
* **Tailwind CSS** + **shadcn/ui** for polished, accessible UI

**Back‑End**

* **FastAPI (Python)** with async endpoints
* **pandas/NumPy** for data transforms
* **(Stretch)** **Celery + Redis** for heavy background jobs

**Environment Variables**

* `NEXT_PUBLIC_API_BASE_URL`
* `NEXT_PUBLIC_MAPBOX_TOKEN`
* `DATA_DIR` (path for cached CSV/JSON)

**Suggested Repo Structure**

```
/ (monorepo optional)
  /apps
    /web (Next.js)
      /app
      /components
      /lib
      /styles
    /api (FastAPI)
      /app
        /routers
        /services
        /models
        /data (cached)
  /packages (optional shared code)
  README.md
  PRD.md
```

**High‑level Flow**

1. User selects entity/year → front‑end requests `/api/...`.
2. FastAPI queries cache/files (or upstream APIs), aggregates via pandas.
3. JSON response → map & charts update; views remain linked.

---

## Functional Requirements

* **Global Overview:** World map colored by tariff/trade metric.
* **Country Details:** Top import/export partners; average tariff rates; total trade values.
* **Bilateral View:** Pair selection with volumes, tariff rates, sector breakdown (Sankey or equivalent).
* **Charts:** At least one deep visualization + 1–2 KPIs/time series.
* **Interactivity:** Hover, select, filter by year/sector.
* **Scenario (optional):** Modify one tariff parameter and reflect indicative changes.
* **Education:** Tooltips, captions, glossary.
* **Performance:** Typical interactions respond ≤2s; no UI freezing.
* **Error Handling:** Friendly fallbacks for missing/unavailable data.

---

## Non‑Functional Requirements

* **Usability:** Intuitive layout, clear labels, no jargon assumptions.
* **Reliability:** Trusted sources; visible data years; cache when upstream is down.
* **Performance:** Smooth Mapbox rendering; efficient pandas aggregations; lazy load.
* **Scalability:** Cloud deploys; no pathological queries (limit data ranges).
* **Maintainability:** Clear separation (data vs presentation); typed props & models.
* **Deployability:** Documented env vars; one‑command deploys if possible.
* **Security:** Validate inputs; restrict API keys; basic OWASP hygiene.
* **Accessibility:** ARIA, keyboard navigation, contrast; captions for charts.

---

## Priorities & Roadmap

**P0 — MVP (Must‑have)**

* World map + hover/click + side panel
* Country KPIs (imports/exports, avg tariffs)
* One deep visualization (Sankey **or** top‑sectors bar)
* Working FE↔BE integration on real data
* Basic tooltips/glossary
* Deployed demo

**P1 — Nice‑to‑have**

* Network graph alt view
* Year filter/time slider
* Polished UI micro‑interactions
* Mini tutorial/coach marks

**P2 — Stretch**

* Scenario simulator
* Drill‑down to HS codes / non‑tariff barriers
* Save/share views; user accounts
* Celery/Redis pipeline; caching layers

---

## Cursor Development Guidelines

> These rules guide AI coding in Cursor for consistent, high‑quality output.

**General Instruction (Project Rule)**

* You are a Senior Front‑End Developer (React/Next/TS/HTML/CSS/Tailwind/shadcn/ui/Radix).
* Follow requirements **to the letter**.
* **First** think step‑by‑step: write a detailed **pseudocode plan**.
* **Then confirm**, **then write code**.
* Ship **correct, DRY, accessible, bug‑free** code aligned with the guidelines below.

**Coding Environment**

* ReactJS, NextJS, JavaScript, TypeScript, TailwindCSS, HTML, CSS

**Code Implementation Guidelines**

* Prefer **early returns**.
* Use **Tailwind** classes (no global CSS files or `<style>` tags).
* Prefer `class:*` utilities over ternary‑heavy class logic.
* Descriptive names; event handlers prefixed with `handle*`.
* Add accessibility: `tabIndex`, `aria-*`, keyboard handlers for non‑button interactive elements; respect color contrast.
* Use `const` arrow components; define TS types/interfaces for props and data.
* **kebab‑case** files/folders (e.g., `trade-map.tsx`).

**Optional Cursor Prompt Snippet**

```md
Role: Senior React/Next engineer. Follow PRD.md.
Step 1: Produce a detailed pseudocode build plan for the requested component/page.
Step 2: Wait for confirmation.
Step 3: Implement production‑ready, accessible, DRY code with Tailwind and shadcn/ui.
Constraints: No inline <style>; use TypeScript types; early returns; kebab‑case files; add tests where feasible.
```

---

## API Contracts (Draft)

> **Note:** Keep responses small and focused. Include `year` in all endpoints.

### `GET /api/country/{code}/summary?year=2022`

**Response**

```json
{
  "country": "USA",
  "year": 2022,
  "imports_total_usd": 3000000000000,
  "exports_total_usd": 2200000000000,
  "avg_tariff_mfn": 3.2,
  "avg_tariff_weighted": 2.8,
  "percent_tariff_free_imports": 47.1,
  "top_partners": [
    {"partner": "CHN", "imports_usd": 550000000000, "exports_usd": 150000000000},
    {"partner": "MEX", "imports_usd": 480000000000, "exports_usd": 330000000000}
  ],
  "top_sectors": [
    {"hs_section": "Electronics", "imports_usd": 420000000000, "avg_tariff": 2.5},
    {"hs_section": "Agriculture", "imports_usd": 120000000000, "avg_tariff": 5.7}
  ]
}
```

### `GET /api/trade-flow?from=USA&to=CHN&year=2022`

**Response**

```json
{
  "from": "USA",
  "to": "CHN",
  "year": 2022,
  "flows": [
    {"direction": "export", "hs_section": "Machinery", "value_usd": 88000000000, "avg_tariff_partner": 4.1},
    {"direction": "import", "hs_section": "Electronics", "value_usd": 310000000000, "avg_tariff_home": 2.5}
  ]
}
```

### `POST /api/scenario`

**Body**

```json
{
  "from": "USA",
  "to": "CHN",
  "year": 2022,
  "sector": "Electronics",
  "tariff_delta_pct": 5,
  "method": "elasticity_sensitivity",
  "elasticity_assumption": -1.5
}
```

**Response**

```json
{
  "baseline": {"value_usd": 310000000000, "avg_tariff": 2.5},
  "assumptions": {"elasticity": -1.5},
  "delta": {"value_usd": -15000000000, "avg_price_index": 0.7},
  "result": {"value_usd": 295000000000, "avg_tariff": 7.5}
}
```

---

## Data Model (Draft)

```ts
export interface CountrySummary {
  country: string; // ISO3
  year: number;
  imports_total_usd: number;
  exports_total_usd: number;
  avg_tariff_mfn: number; // %
  avg_tariff_weighted: number; // %
  percent_tariff_free_imports: number; // %
  top_partners: Array<{ partner: string; imports_usd: number; exports_usd: number }>;
  top_sectors: Array<{ hs_section: string; imports_usd: number; avg_tariff: number }>;
}

export interface TradeFlow {
  from: string; // ISO3
  to: string; // ISO3
  year: number;
  flows: Array<{
    direction: "export" | "import";
    hs_section: string;
    value_usd: number;
    avg_tariff_home?: number; // tariff applied by home on imports
    avg_tariff_partner?: number; // tariff applied by partner on our exports
  }>;
}
```

---

## Engineering Playbook

**Local Dev Setup**

```bash
# Frontend
cd apps/web
pnpm i
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_MAPBOX_TOKEN
pnpm dev

# Backend
cd ../api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATA_DIR=./app/data
uvicorn app.main:app --reload --port 5050
```

**Performance Budgets**

* Map hover → tooltip: ≤100ms
* Chart re‑render after filter: ≤500ms
* Country pair query round‑trip (cached): ≤1.2s

**Accessibility Checklist**

* Keyboard focus order on map + panels
* ARIA labels for interactive SVG nodes
* Chart captions & alt summaries

**Error States**

* “Data unavailable for selection (year: XXXX). Try another year or pair.”
* Offline/cached banners when using stale data

---

## Definition of Done & QA

**DoD (per feature)**

* Acceptance criteria satisfied & demoed
* Type‑safe props and API responses
* Unit smoke tests for utilities
* Lighthouse a11y score ≥ 90 on core pages
* No console errors/warnings

**Acceptance Criteria — P0**

* Select country → side panel shows KPIs + top partners (✅)
* Bilateral pair → Sankey or bar breakdown (✅)
* Year filter updates all linked views (✅)
* Tooltips explain metrics in plain language (✅)

---

## Demo Script (Hackathon)

1. **Open** app → global heat map; mention data year.
2. **Select USA** → read KPIs; highlight top partners.
3. **Pair with China** → Sankey by sector; narrate dominant flows.
4. **Toggle Year** (if P1) → show trend shift.
5. **Explain** a tooltip (weighted tariff) and glossary.
6. **(If P2)** Run a scenario preset and watch deltas.
7. **Close** with “quiet but powerful” UX principle.

---

## Glossary

* **Tariff:** Tax on imported goods.
* **MFN (Most‑Favored Nation):** Standard WTO tariff treatment for all members.
* **HS Code/Section:** Harmonized System product classification.
* **Weighted Tariff:** Import‑weighted average duty rate.
* **Trade Balance:** Exports − Imports.

---

## References

* World Bank WITS — World Integrated Trade Solution (for tariffs & indicators)
* UN Comtrade (for bilateral trade statistics)
* WTO Tariff Schedules (context & definitions)

---

> **Build Philosophy:** If a feature doesn’t make learning simpler, it doesn’t ship.
