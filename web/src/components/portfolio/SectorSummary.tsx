"use client";

import clsx from "clsx";

import {
  formatCurrency,
  formatNumber,
  formatPercent,
  gainLossTone,
} from "@/lib/formatters";
import type { SectorSummary as SectorSummaryType } from "@/types/portfolio";

type SectorSummaryProps = {
  sectors: SectorSummaryType[];
};

export const SectorSummary = ({ sectors }: SectorSummaryProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sectors.map((sector) => (
        <div
          key={sector.sector}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {sector.sector}
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Allocation {formatPercent(sector.allocation)}
            </span>
          </header>
          <dl className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <dt>Investment</dt>
              <dd className="font-medium text-slate-900">
                {formatCurrency(sector.investment)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Present Value</dt>
              <dd className="font-medium text-slate-900">
                {formatCurrency(sector.presentValue)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Gain/Loss</dt>
              <dd className={clsx("font-semibold", gainLossTone(sector.gainLoss))}>
                {formatCurrency(sector.gainLoss)}
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
};
