import rawData from "@/data/portfolio_data.json";
import type {
  PortfolioStock,
  RawPortfolioData,
  RawSectorSummary,
  RawStock,
  SectorSummary,
} from "@/types/portfolio";

type NormalizedStock = PortfolioStock;

type CodeNormalization = {
  exchange: "NSE" | "BSE";
  yahooSymbol: string;
  googleExchange: "NSE" | "BOM";
  googleSymbol: string;
  code: string;
};

const data = rawData as RawPortfolioData;

const sanitizeNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeCode = (code: string | number): CodeNormalization => {
  const raw = String(code).trim();
  const sanitized = raw.replace(/\s+/g, "").toUpperCase();
  const isNumeric = /^\d+$/.test(sanitized);

  const exchange = isNumeric ? "BSE" : "NSE";
  const yahooSymbol = isNumeric ? `${sanitized}.BO` : `${sanitized}.NS`;
  const googleExchange = isNumeric ? "BOM" : "NSE";
  const googleSymbol = sanitized;

  return { exchange, yahooSymbol, googleExchange, googleSymbol, code: sanitized };
};

const normalizeStock = (stock: RawStock): NormalizedStock => {
  const {
    code,
    exchange,
    yahooSymbol,
    googleExchange,
    googleSymbol,
  } = normalizeCode(stock["NSE/BSE"]);

  const investment = sanitizeNumber(stock.Investment) ?? 0;
  const quantity = sanitizeNumber(stock.Qty) ?? 0;
  const cmp = sanitizeNumber(stock.CMP);
  const presentValue = sanitizeNumber(stock["Present value"]);
  const gainLoss = sanitizeNumber(stock["Gain/Loss"]);
  const peRatio = sanitizeNumber(stock["P/E (TTM)"]);
  const latestEarnings = sanitizeNumber(stock["Latest Earnings"]);

  return {
    id: `${code}-${exchange}`,
    name: stock.Particulars.trim(),
    purchasePrice: sanitizeNumber(stock["Purchase Price"]) ?? 0,
    quantity,
    investment,
    portfolioWeight: sanitizeNumber(stock["Portfolio (%)"]) ?? 0,
    exchangeCode: code,
    exchange,
    yahooSymbol,
    googleSymbol,
    googleExchange,
    cmp,
    presentValue,
    gainLoss,
    peRatio,
    latestEarnings,
    sector: stock.Sector.trim(),
    lastUpdated: null,
  };
};

const normalizeSector = (sector: RawSectorSummary): SectorSummary => ({
  sector: sector.Sector.trim(),
  investment: sanitizeNumber(sector.Investment) ?? 0,
  presentValue: sanitizeNumber(sector["Present value"]) ?? 0,
  gainLoss: sanitizeNumber(sector["Gain/Loss"]) ?? 0,
  allocation: 0,
});

export const baseStocks: PortfolioStock[] = data.stocks.map(normalizeStock);

export const baseSectors: SectorSummary[] = data.sectors.map(normalizeSector);

export const totalInvestment = baseStocks.reduce(
  (sum, stock) => sum + stock.investment,
  0,
);

export const getBaseStockById = (id: string) =>
  baseStocks.find((stock) => stock.id === id);

export const getBaseData = () => ({
  stocks: baseStocks,
  sectors: baseSectors,
  totalInvestment,
});
