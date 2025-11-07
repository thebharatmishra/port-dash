import * as cheerio from "cheerio";
import NodeCache from "node-cache";
import YahooFinance from "yahoo-finance2";

import { baseStocks, totalInvestment } from "@/lib/portfolioData";
import type { PortfolioSnapshot, PortfolioStock } from "@/types/portfolio";

// Initialize Yahoo Finance client
const yahooFinance = new YahooFinance();

type YahooQuote = {
  price: number | null;
  lastUpdated: string | null;
  currency: string | null;
};

type GoogleFinancials = {
  peRatio: number | null;
  latestEarnings: number | null;
};

const cache = new NodeCache({ stdTTL: 15, checkperiod: 120 });

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const parseNumericText = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const trimmed = value.replace(/[,\s]/g, "").replace(/₹|\$|£|€|Rs\.?/gi, "");
  const cleaned = trimmed.replace(/[–—-]/g, "-");
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : null;
};

const roundToTwo = (value: number | null): number | null => {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
};

const fetchYahooQuote = async (symbol: string): Promise<YahooQuote> => {
  const cacheKey = `yahoo:${symbol}`;
  const cached = cache.get<YahooQuote>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = (await yahooFinance.quote(symbol)) as any;

    // result is flat with regularMarketPrice at top level
    // Some symbols (especially BSE) may return null
    if (result === null || result === undefined || typeof result !== "object") {
      throw new Error("Symbol not found or invalid response");
    }

    const priceValue =
      typeof result.regularMarketPrice === "number"
        ? result.regularMarketPrice
        : null;

    // regularMarketTime can be a string (ISO) or number (timestamp)
    let lastUpdated: string | null = null;
    if (result.regularMarketTime) {
      if (typeof result.regularMarketTime === "string") {
        lastUpdated = new Date(result.regularMarketTime).toISOString();
      } else if (typeof result.regularMarketTime === "number") {
        lastUpdated = new Date(result.regularMarketTime * 1000).toISOString();
      }
    }

    const currencyValue =
      typeof result.currency === "string" ? result.currency : null;

    const payload: YahooQuote = {
      price: priceValue,
      lastUpdated,
      currency: currencyValue ? currencyValue.toUpperCase() : null,
    };

    cache.set(cacheKey, payload);
    return payload;
  } catch (error) {
    throw new Error(
      `Yahoo Finance quote failed for ${symbol}: ${(error as Error).message}`
    );
  }
};

const fetchGoogleFinancials = async (
  symbol: string,
  exchange: "NSE" | "BOM"
): Promise<GoogleFinancials> => {
  const cacheKey = `google:${symbol}:${exchange}`;
  const cached = cache.get<GoogleFinancials>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Google Finance responded with ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  let peRatio: number | null = null;
  let latestEarnings: number | null = null;

  $(".gyFHrc").each((_, element) => {
    const label = $(element).find(".mfs7Fc").first().text().trim();
    const value = $(element).find(".P6K39c").first().text().trim();

    if (/P\/?E/i.test(label)) {
      peRatio = parseNumericText(value);
    }

    if (/EPS/i.test(label) || /Earnings per share/i.test(label)) {
      latestEarnings = parseNumericText(value);
    }
  });

  const payload: GoogleFinancials = {
    peRatio,
    latestEarnings,
  };

  cache.set(cacheKey, payload);
  return payload;
};

const computeDerivedMetrics = (stock: PortfolioStock, cmp: number | null) => {
  const effectiveCmp = cmp ?? stock.cmp ?? null;
  const presentValue =
    effectiveCmp !== null ? roundToTwo(effectiveCmp * stock.quantity) : null;
  const gainLoss =
    presentValue !== null ? roundToTwo(presentValue - stock.investment) : null;

  return { cmp: effectiveCmp, presentValue, gainLoss };
};

const buildSnapshotStocks = async () => {
  const warnings: string[] = [];

  const updatedStocks = await Promise.all(
    baseStocks.map(async (stock) => {
      let quote: YahooQuote | null = null;
      let fundamentals: GoogleFinancials | null = null;

      try {
        quote = await fetchYahooQuote(stock.yahooSymbol);
      } catch (error) {
        warnings.push((error as Error).message);
      }

      try {
        fundamentals = await fetchGoogleFinancials(
          stock.googleSymbol,
          stock.googleExchange
        );
      } catch (error) {
        warnings.push((error as Error).message);
      }

      const metrics = computeDerivedMetrics(stock, quote?.price ?? null);

      return {
        ...stock,
        cmp: metrics.cmp,
        presentValue: metrics.presentValue,
        gainLoss: metrics.gainLoss,
        peRatio: fundamentals?.peRatio ?? stock.peRatio ?? null,
        latestEarnings:
          fundamentals?.latestEarnings ?? stock.latestEarnings ?? null,
        lastUpdated: quote?.lastUpdated ?? stock.lastUpdated,
      } satisfies PortfolioStock;
    })
  );

  return { stocks: updatedStocks, warnings };
};

const aggregateSectors = (stocks: PortfolioStock[]) => {
  const sectorMap = new Map<
    string,
    { investment: number; presentValue: number }
  >();

  stocks.forEach((stock) => {
    const presentValue = stock.presentValue ?? stock.investment;
    const sectorTotals = sectorMap.get(stock.sector) ?? {
      investment: 0,
      presentValue: 0,
    };

    sectorTotals.investment += stock.investment;
    sectorTotals.presentValue += presentValue;

    sectorMap.set(stock.sector, sectorTotals);
  });

  return Array.from(sectorMap.entries()).map(([sector, totals]) => {
    const gainLoss = totals.presentValue - totals.investment;
    const allocation = totalInvestment
      ? (totals.investment / totalInvestment) * 100
      : 0;

    return {
      sector,
      investment: roundToTwo(totals.investment) ?? 0,
      presentValue: roundToTwo(totals.presentValue) ?? 0,
      gainLoss: roundToTwo(gainLoss) ?? 0,
      allocation: roundToTwo(allocation) ?? 0,
    };
  });
};

export const getPortfolioSnapshot = async (): Promise<PortfolioSnapshot> => {
  const { stocks, warnings } = await buildSnapshotStocks();

  const totals = stocks.reduce(
    (acc, stock) => {
      const presentValue = stock.presentValue ?? stock.investment;
      return {
        investment: acc.investment + stock.investment,
        presentValue: acc.presentValue + presentValue,
        gainLoss: acc.gainLoss + (presentValue - stock.investment),
      };
    },
    { investment: 0, presentValue: 0, gainLoss: 0 }
  );

  const roundedTotals = {
    investment: roundToTwo(totals.investment) ?? 0,
    presentValue: roundToTwo(totals.presentValue) ?? 0,
    gainLoss: roundToTwo(totals.gainLoss) ?? 0,
  };

  const sectors = aggregateSectors(stocks);

  return {
    stocks,
    sectors,
    totals: roundedTotals,
    warnings,
    lastUpdated: new Date().toISOString(),
  } satisfies PortfolioSnapshot;
};
