"use client";

import { fmtMoney } from "@/lib/costing";

function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : null;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export default function InvoiceMonthlyChart({ invoices }) {
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

  const chartHeight = 160;
  const barWidth = 36;
  const gap = 18;
  const chartWidth = rows.length * (barWidth + gap) + gap;

  return (
    <div className="bk-card">
      <div className="bk-card-head">
        <h4>Invoice amount by month</h4>
      </div>
      <div className="bk-chart-scroll">
        <svg width={chartWidth} height={chartHeight + 30} viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}>
          {rows.map((r, i) => {
            const barHeight = maxTotal > 0 ? (r.total / maxTotal) * chartHeight : 0;
            const x = gap + i * (barWidth + gap);
            const y = chartHeight - barHeight;
            return (
              <g key={r.key}>
                <title>{`${r.label}: ${fmtMoney(r.total)} across ${r.count} invoice${r.count === 1 ? "" : "s"}`}</title>
                <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx={3} style={{ fill: "var(--teal)" }} />
                <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" className="bk-chart-label">
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
