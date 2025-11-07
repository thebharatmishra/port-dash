# DashPort – Technical Notes

`Used AI for formatting the documentation`

## 1. Data Integration

- **Yahoo Finance (CMP)** – `yahoo-finance2` library is used, wrapped with a 15s `node-cache` to keep requests under rate limits. The API exposes `regularMarketPrice` and `regularMarketTime`, which are normalised into INR pricing and ISO timestamps.
- **Google Finance (P/E & EPS)** – No official API is available. We fetch the public HTML page (`https://www.google.com/finance/quote/{symbol}:{exchange}`) with a desktop user-agent and parse the financial summary rows (`.gyFHrc`) using `cheerio`. Extracted labels are matched against regex patterns (`P/E`, `EPS`, `Earnings per share`).
- **Fallbacks** – The seed JSON retains the last known CMP/P&E/EPS. When an upstream fetch fails, the service falls back to these values and pushes a warning string into the API payload for transparency.

## 2. Symbol Normalisation

- Data mixes NSE tickers (strings) and BSE codes (numeric). Normalisation heuristics: purely numeric → BSE (`.BO` / `:BOM`), alphanumeric → NSE (`.NS` / `:NSE`).
- The helper in `portfolioData.ts` performs string sanitation, attaches exchange metadata, and ensures TypeScript sees the literal union types (`"NSE" | "BSE"`, `"NSE" | "BOM"`).

## 3. Derived Metrics

- Present Value = CMP × Quantity, computed with live CMP whenever available, otherwise seeded CMP.
- Gain/Loss = Present Value − Investment; values drive Tailwind tone utilities (`gainLossTone`) for red/green styling.
- Sector summaries aggregate investment and present value per sector, recalculate allocation percentages, and return sorted data to UI components.

## 4. Caching & Refresh Strategy

- API route `GET /api/portfolio` is executed server-side and caches Yahoo/Google responses for 15 seconds.
- Frontend uses a 15 second `setInterval` plus a manual refresh button. While refreshing, a flag disables the button and shows “Refreshing…” label.
- API warnings surface directly under the KPI cards, allowing interviewers to see when scraping failed during demos.

## 5. Build & Deployment Considerations

- `next.config.mjs` sets `transpilePackages` for `@tanstack/react-table` to ensure the Next.js compiler can bundle its ESM output.
- The API route is dynamic and may exceed static generation limits; Next.js automatically retried once during build. In production, we can add `export const dynamic = "force-dynamic";` to skip static pre-render.
- `npm run build` performs lint + type checks and produces a fully static `/` page served by the API route at runtime.

## 6. Follow-up Enhancements

1. **Resilience** – Add retry/backoff (e.g. `p-retry`) and metrics around upstream failures.
2. **Persistence** – Persist snapshots in a lightweight DB (SQLite/Planetscale) for historical P&L trend charts.
3. **Testing** – Introduce Vitest for unit tests (formatters, sector aggregation) and Playwright for smoke tests.
4. **Theming** – Add dark mode + mobile first improvements.
5. **Authentication** – Secure the dashboard, especially if extended with user input or private APIs.

---

_Prepared for the Octa Byte AI Pvt Ltd case study interview._
