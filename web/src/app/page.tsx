"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { KpiCards } from "@/components/portfolio/KpiCards";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { SectorAllocationChart } from "@/components/portfolio/SectorAllocationChart";
import { SectorSummary } from "@/components/portfolio/SectorSummary";
import type { PortfolioSnapshot } from "@/types/portfolio";

const REFRESH_INTERVAL = 15_000;

export default function Home() {
  const [data, setData] = useState<PortfolioSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchSnapshot = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setIsLoading(true);
    }
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolio", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as PortfolioSnapshot;
      setData(payload);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot(true);
  }, [fetchSnapshot]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchSnapshot(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchSnapshot]);

  const hasData = useMemo(() => data && data.stocks.length > 0, [data]);

  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Made in Fulfillment of assignment for Octa Byte AI Pvt Ltd
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            DashPort · Dynamic Portfolio Dashboard
          </h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Real-time view of holdings across sectors with live pricing sourced from
            Yahoo Finance and key ratios scraped from Google Finance. Automatically
            refreshes every 15 seconds.
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        )}

        {hasData && data && (
          <>
            <KpiCards
              totals={data.totals}
              lastUpdated={data.lastUpdated}
              isRefreshing={isRefreshing}
              warnings={data.warnings}
              onRefresh={() => fetchSnapshot(true)}
            />

            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <PortfolioTable data={data.stocks} />
              <SectorAllocationChart data={data.sectors} />
            </section>

            <SectorSummary sectors={data.sectors} />
          </>
        )}

        {!isLoading && !hasData && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            No holdings available. Please verify the portfolio configuration.
          </div>
        )}
      </div>
    </main>
  );
}
