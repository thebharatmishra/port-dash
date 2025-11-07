"use client";

import clsx from "clsx";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";

import {
  formatCurrency,
  formatNumber,
  formatPercent,
  gainLossTone,
} from "@/lib/formatters";
import type { PortfolioStock } from "@/types/portfolio";

type PortfolioTableProps = {
  data: PortfolioStock[];
};

const columnHelper = createColumnHelper<PortfolioStock>();

const useColumns = () => {
  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Particulars",
        cell: (info) => (
          <div>
            <p className="font-medium text-slate-900">{info.getValue()}</p>
            <p className="text-xs text-slate-500">
              {info.row.original.exchangeCode} · {info.row.original.exchange}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("purchasePrice", {
        header: "Purchase Price",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("quantity", {
        header: "Qty",
        cell: (info) => formatNumber(info.getValue()),
      }),
      columnHelper.accessor("investment", {
        header: "Investment",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("portfolioWeight", {
        header: "Portfolio %",
        cell: (info) => formatPercent(info.getValue() * 100),
      }),
      columnHelper.accessor("cmp", {
        header: "CMP",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("presentValue", {
        header: "Present Value",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("gainLoss", {
        header: "Gain/Loss",
        cell: (info) => (
          <span className={clsx("font-medium", gainLossTone(info.getValue()))}>
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("peRatio", {
        header: "P/E Ratio",
        cell: (info) => formatNumber(info.getValue()),
      }),
      columnHelper.accessor("latestEarnings", {
        header: "Latest Earnings",
        cell: (info) => formatCurrency(info.getValue()),
      }),
    ],
    [],
  );
};

export const PortfolioTable = ({ data }: PortfolioTableProps) => {
  const columns = useColumns();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
