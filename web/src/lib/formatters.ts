const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) return "—";
  return currencyFormatter.format(value);
};

export const formatNumber = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) return "—";
  return numberFormatter.format(value);
};

export const formatPercent = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) return "—";
  return percentFormatter.format(value / 100);
};

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
};

export const gainLossTone = (value: number | null) => {
  if (value === null) return "text-slate-500";
  if (value > 0) return "text-gain";
  if (value < 0) return "text-loss";
  return "text-slate-500";
};

export const pillTone = (value: number | null) => {
  if (value === null) return "bg-slate-200 text-slate-700";
  if (value > 0) return "bg-emerald-100 text-emerald-700";
  if (value < 0) return "bg-rose-100 text-rose-700";
  return "bg-slate-200 text-slate-700";
};
