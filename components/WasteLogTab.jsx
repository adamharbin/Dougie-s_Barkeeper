"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { loadWasteLog, deleteWasteEntry } from "@/lib/db";
import { fmtMoney, fmtDate, weightedAvgCost } from "@/lib/costing";
import { SectionHead, EmptyState } from "./ui";
import WasteLogModal from "./WasteLogModal";

const CATEGORIES = ["Spoilage/Expired", "Over-prep", "Breakage/Spill", "Comp/Mistake", "Other"];
const SORT_DEFAULT_DIR = { item: "asc", category: "asc", reason: "asc", date: "desc", quantity: "desc", cost: "desc" };

export default function WasteLogTab({ items, prices }) {
  const { isAdmin } = useAuth();
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    (async () => {
      try {
        setEntries(await loadWasteLog());
      } catch (e) {
        console.error("loadWasteLog failed:", e?.message || e, e);
        setError("Couldn't load the waste log — check your connection and try again.");
      }
    })();
  }, []);

  // Reused after a mutation (add/edit/delete), called from event handlers
  // only — never invoked directly inside an effect.
  async function refresh() {
    try {
      setEntries(await loadWasteLog());
      setError("");
    } catch (e) {
      console.error("loadWasteLog failed:", e?.message || e, e);
      setError("Couldn't reload the waste log — check your connection and try again.");
    }
  }

  async function handleDelete(entry) {
    if (!isAdmin) return;
    if (!confirm("Delete this waste entry?")) return;
    try {
      await deleteWasteEntry(entry.id);
      await refresh();
    } catch (e) {
      console.error("deleteWasteEntry failed:", e?.message || e, e);
      alert("Couldn't delete that entry — check your connection and try again.");
    }
  }

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(SORT_DEFAULT_DIR[key] || "asc");
    }
  }

  if (error) return <p className="bk-error-text">{error}</p>;
  if (!entries) return <div className="bk-loading">Fetching the bowl of data…</div>;

  const withItem = entries
    .filter((e) => !categoryFilter || e.category === categoryFilter)
    .filter((e) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const item = items.find((i) => i.id === e.item_id);
      return (item?.name || "").toLowerCase().includes(q) || (e.reason || "").toLowerCase().includes(q);
    })
    .map((e) => {
      const item = items.find((i) => i.id === e.item_id);
      const avgCost = item ? weightedAvgCost(item.id, prices) : null;
      const cost = avgCost != null ? avgCost * Number(e.quantity || 0) : null;
      return { e, item, cost };
    });

  const sorted = [...withItem].sort((a, b) => {
    let av, bv;
    switch (sortKey) {
      case "item":
        av = (a.item?.name || "").toLowerCase();
        bv = (b.item?.name || "").toLowerCase();
        break;
      case "category":
        av = a.e.category || "";
        bv = b.e.category || "";
        break;
      case "reason":
        av = (a.e.reason || "").toLowerCase();
        bv = (b.e.reason || "").toLowerCase();
        break;
      case "quantity":
        av = Number(a.e.quantity || 0);
        bv = Number(b.e.quantity || 0);
        break;
      case "cost":
        av = a.cost == null ? -Infinity : a.cost;
        bv = b.cost == null ? -Infinity : b.cost;
        break;
      case "date":
      default:
        av = a.e.waste_date || "";
        bv = b.e.waste_date || "";
        break;
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalCost = sorted.reduce((s, { cost }) => s + (cost || 0), 0);

  function sortTh(label, key) {
    const active = sortKey === key;
    return (
      <th className="bk-sortable-th" onClick={() => toggleSort(key)}>
        {label}{active ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
      </th>
    );
  }

  return (
    <div>
      <SectionHead
        title="Waste log"
        desc="Track spoilage, over-prep, breakage, and comps — and what it's costing."
        action={<button className="bk-btn-primary" onClick={() => setAddingNew(true)}>+ Log waste</button>}
      />
      <div className="bk-toolbar">
        <input className="bk-input" placeholder="Search item or reason…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="bk-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {sorted.length === 0 ? (
        <EmptyState text="No waste logged yet." sub="Log an entry to start tracking what's being lost." />
      ) : (
        <table className="bk-table bk-table-sticky-head">
          <thead>
            <tr>
              {sortTh("Date", "date")}
              {sortTh("Item", "item")}
              {sortTh("Category", "category")}
              {sortTh("Quantity", "quantity")}
              {sortTh("Reason", "reason")}
              {sortTh("Est. cost", "cost")}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ e, item, cost }) => (
              <tr key={e.id}>
                <td>{fmtDate(e.waste_date)}</td>
                <td>{item?.name || "—"}</td>
                <td>{e.category}</td>
                <td>{e.quantity} {item?.recipe_unit || ""}</td>
                <td>{e.reason || "—"}</td>
                <td>{cost == null ? "—" : fmtMoney(cost)}</td>
                <td className="bk-row-actions">
                  <button className="bk-link" onClick={() => setEditing(e)}>Edit</button>
                  {isAdmin && <button className="bk-link bk-link-danger" onClick={() => handleDelete(e)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bk-table-avg-row">
              <td colSpan={5}>Total ({sorted.length} entr{sorted.length === 1 ? "y" : "ies"})</td>
              <td>{fmtMoney(totalCost)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      )}
      {(editing || addingNew) && (
        <WasteLogModal
          entry={editing}
          items={items}
          onClose={() => { setEditing(null); setAddingNew(false); }}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
