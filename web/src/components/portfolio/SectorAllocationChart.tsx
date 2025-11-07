"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { formatPercent } from "@/lib/formatters";
import type { SectorSummary } from "@/types/portfolio";

type SectorAllocationChartProps = {
  data: SectorSummary[];
};

const COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#e11d48",
  "#a855f7",
  "#14b8a6",
];

export const SectorAllocationChart = ({ data }: SectorAllocationChartProps) => {
  const chartData = data.map((sector) => ({
    name: sector.sector,
    value: sector.allocation,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Sector Allocation
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatPercent(value)}
              labelClassName="text-sm font-medium text-slate-700"
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
