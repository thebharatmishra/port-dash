"use client";

import clsx from "clsx";

import {
    formatCurrency,
    formatDateTime,
    gainLossTone,
} from "@/lib/formatters";

type KpiCardsProps = {
    totals: {
        investment: number;
        presentValue: number;
        gainLoss: number;
    };
    lastUpdated: string | null;
    isRefreshing: boolean;
    warnings: string[];
    onRefresh: () => void;
};

const KPI_CONFIG = [
    {
        key: "investment",
        label: "Total Investment",
        tone: "text-slate-900",
    },
    {
        key: "presentValue",
        label: "Current Value",
        tone: "text-indigo-600",
    },
    {
        key: "gainLoss",
        label: "Unrealised P&L",
        tone: null,
    },
] as const;

export const KpiCards = ({
    totals,
    lastUpdated,
    isRefreshing,
    warnings,
    onRefresh,
}: KpiCardsProps) => {
    return (
        <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                {KPI_CONFIG.map((item) => {
                    const value = totals[item.key];
                    const tone =
                        item.key === "gainLoss" ? gainLossTone(value) : item.tone ?? "";
                    return (
                        <article
                            key={item.key}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {item.label}
                            </p>
                            <p className={clsx("mt-2 text-2xl font-bold", tone)}>
                                {formatCurrency(value)}
                            </p>
                        </article>
                    );
                })}
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-slate-700">
                        Last updated {formatDateTime(lastUpdated)}
                    </p>
                    {warnings.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-amber-600">
                            {warnings.map((warning, index) => (
                                <li key={index}>• {warning}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    disabled={isRefreshing}
                >
                    {isRefreshing ? "Refreshing…" : "Refresh now"}
                </button>
            </div>
        </section>
    );
};
