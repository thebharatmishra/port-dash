export type RawStock = {
  Particulars: string;
  "Purchase Price": number;
  Qty: number;
  Investment: number;
  "Portfolio (%)": number;
  "NSE/BSE": string | number;
  CMP?: number | null;
  "Present value"?: number | null;
  "Gain/Loss"?: number | null;
  "P/E (TTM)"?: number | null;
  "Latest Earnings"?: number | null;
  Sector: string;
};

export type RawSectorSummary = {
  Sector: string;
  Investment: number;
  "Present value": number;
  "Gain/Loss": number;
};

export type RawPortfolioData = {
  stocks: RawStock[];
  sectors: RawSectorSummary[];
};

export type PortfolioStock = {
  id: string;
  name: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioWeight: number;
  exchangeCode: string;
  exchange: "NSE" | "BSE";
  yahooSymbol: string;
  googleSymbol: string;
  googleExchange: "NSE" | "BOM";
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  sector: string;
  lastUpdated: string | null;
};

export type SectorSummary = {
  sector: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
  allocation: number;
};

export type PortfolioSnapshot = {
  stocks: PortfolioStock[];
  sectors: SectorSummary[];
  totals: {
    investment: number;
    presentValue: number;
    gainLoss: number;
  };
  lastUpdated: string;
  warnings: string[];
};
