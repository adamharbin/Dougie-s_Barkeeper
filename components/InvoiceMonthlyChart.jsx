"use client";

import { useState } from "react";
import { fmtMoney } from "@/lib/costing";

function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : null;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export default function InvoiceMonthlyChart({ invoices }) {
  const [hoverKey, setHoverKey] = useState(null);

  const byMonth = new Map();
  invoices.forEach((inv) => {
    if (inv.total_amount == null) return;
    const key = monthKey(inv.invoice_date);
    if (!key) return;
    const entry = byMonth.get(key) || { total: 0, count: 0 };
    entry.total += Number(inv.total_amount);
    entry.count += 1;
    byMonth.set(key, entry);
  });

  const months = [...byMonth.keys()].sort();
  if (months.length === 0) return null;

  const rows = months.map((key) => ({ key, label: monthLabel(key), ...byMonth.get(key) }));
  const maxTotal = Math.max(...rows.map((r) => r.total), 0);

  const topPadding = 22;
  const plotHeight = 160;
  const barWidth = 36;
  const gap = 18;
  const chartWidth = rows.length * (barWidth + gap) + gap;
  const chartHeight = topPadding + plotHeight + 30;

  return (
    <div className="bk-card">
      <div className="bk-card-head">
        <h4>Invoice amount by month</h4>
      </div>
      <div className="bk-chart-scroll">
        <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {rows.map((r, i) => {
            const barHeight = maxTotal > 0 ? (r.total / maxTotal) * plotHeight : 0;
            const x = gap + i * (barWidth + gap);
            const y = topPadding + (plotHeight - barHeight);
            const hovered = hoverKey === r.key;
            return (
              <g
                key={r.key}
                onMouseEnter={() => setHoverKey(r.key)}
                onMouseLeave={() => setHoverKey(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Full-column hit area so short bars are still easy to hover */}
                <rect x={x} y={topPadding} width={barWidth} height={plotHeight} fill="transparent" />
                <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx={3} style={{ fill: hovered ? "var(--orange)" : "var(--teal)" }} />
                {hovered && (
                  <text x={x + barWidth / 2} y={Math.max(y - 6, 14)} textAnchor="middle" className="bk-chart-tooltip">
                    {fmtMoney(r.total)}
                  </text>
                )}
                <text x={x + barWidth / 2} y={topPadding + plotHeight + 16} textAnchor="middle" className="bk-chart-label">
                  {r.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <table className="bk-table bk-table-compact">
        <thead>
          <tr><th>Month</th><th>Total</th><th>Invoices</th></tr>
        </thead>
        <tbody>
          {[...rows].reverse().map((r) => (
            <tr key={r.key}>
              <td>{r.label}</td>
              <td>{fmtMoney(r.total)}</td>
              <td>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
