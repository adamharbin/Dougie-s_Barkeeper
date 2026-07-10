"use client";

import { useEffect, useState } from "react";
import { loadInventoryCounts } from "@/lib/db";
import { fmtMoney, fmtDate } from "@/lib/costing";
import { EmptyState } from "./ui";

export default function CountHistory() {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setCounts(await loadInventoryCounts());
      } catch (e) {
        console.error("loadInventoryCounts failed:", e?.message || e, e);
        setError("Couldn't load count history — check your connection and try again.");
      }
    })();
  }, []);

  if (error) return <p className="bk-error-text">{error}</p>;
  if (!counts) return <div className="bk-loading">Fetching the bowl of data…</div>;

  return counts.length === 0 ? (
    <EmptyState text="No counts logged yet." sub="Run an inventory count to start tracking on-hand value over time." />
  ) : (
    <table className="bk-table">
      <thead><tr><th>Date</th><th>Total inventory value</th><th>Logged</th></tr></thead>
      <tbody>
        {counts.map((c) => (
          <tr key={c.id}>
            <td>{fmtDate(c.count_date)}</td>
            <td>{fmtMoney(c.total_value)}</td>
            <td>{fmtDate(c.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
