## DashPort – Dynamic Portfolio Dashboard

`Used AI for formatting the documentation`

DashPort is a full-stack assignment for **Octa Byte AI Pvt Ltd** showcasing a live portfolio dashboard with sector-level insights, real-time market data, and automated refresh cycles.

### Key Features

- Holdings table with CMP, valuation, and P&L visual cues (green gain / red loss)
- Sector level aggregation cards and allocation donut chart
- Live data refresh every 15 seconds with manual refresh control
- Yahoo Finance (CMP) + Google Finance (P/E & EPS) ingestion with caching + graceful fallback to seed data
- Typed Node.js API route, caching, and robust error/warning surface to UI

### Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, TypeScript
- **Backend (API Route):** Node.js runtime inside Next.js (Edge disabled for scraping libraries)
- **Data:** `yahoo-finance2`, `cheerio` scraping, seed JSON imported from `src/data/portfolio_data.json`
- **UI Components:** `@tanstack/react-table`, `recharts`, Tailwind

---

## Project Structure

```
src/
  app/
    api/portfolio/route.ts   # REST endpoint returning live snapshot
    layout.tsx               # Global layout + metadata
    page.tsx                 # Dashboard page
    globals.css              # Tailwind base + theme tokens
  components/portfolio/      # UI widgets (table, KPI cards, chart, sectors)
  data/portfolio_data.json   # Seed portfolio & sector data
  lib/
    financeService.ts        # Yahoo/Google fetchers + caching + aggregation
    portfolioData.ts         # JSON normalisation helpers
    formatters.ts            # Shared number/time utilities
  types/portfolio.ts         # Strict domain typings
```

---

## Prerequisites

- Node.js **20.x** (project tested with v20.18.0)
- npm (ships with Node 20)

---

## Setup & Commands

```bash
# 1. Install dependencies
npm install

# 2. Development server (http://localhost:3000)
npm run dev

# 3. Lint (ESLint + TypeScript)
npm run lint

# 4. Production build
npm run build

# 5. Optional: start built artefact
npm run start
```

> The build step hits live Yahoo/Google endpoints for every stock. If scraping is throttled or takes longer than 60s the route is retried; warnings are surfaced in the UI.

---

## Environment & Configuration

- No API keys are required; data uses public endpoints.
- If you introduce authenticated feeds, add a `.env.local` and reference via `process.env` inside `financeService.ts`.
- `next.config.mjs` transpiles `@tanstack/react-table` for compatibility with the Next.js build pipeline.

---

## Data Strategy & Caching

- **Seed data:** `portfolio_data.json` supplies purchase metrics and acts as fallback when external calls fail.
- **Yahoo Finance:** `yahoo-finance2` fetches CMP and last update time per symbol.
- **Google Finance:** Raw HTML is fetched and parsed with `cheerio` to extract P/E ratio and EPS (latest earnings).
- **Cache:** `node-cache` holds responses for 15 seconds to limit rate hits and power the refresh interval.
- **Error handling:** Exceptions are captured, logged into the response `warnings`, and displayed in the UI while falling back to seed values.

---

## Known Limitations / Next Steps

- **Unofficial APIs:** Both Yahoo and Google scraping can break if markup or endpoints change. A production solution should wrap calls in feature flags, consider paid APIs, and add integration tests.
- **Symbol heuristics:** NSE vs BSE resolution is guessed via alphanumeric (NSE) or numeric (BSE) codes. Edge cases may require an explicit mapping file.
- **Rate limiting:** Large portfolios may overwhelm free endpoints. For scale, add request batching, persistence layer, and background job scheduler.
- **Testing:** Only lint/type checks are included. Add unit tests (Vitest/Jest) for formatter utilities and service functions if required.

---

## Credits

- Assignment brief by Octa Byte AI Pvt Ltd
- Data sourced from Yahoo Finance & Google Finance (public endpoints)
