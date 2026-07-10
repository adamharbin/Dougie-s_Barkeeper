"use client";

import { useMemo, useState } from "react";
import { saveInventoryCount } from "@/lib/db";
import { weightedAvgCost, fmtMoney, todayISO } from "@/lib/costing";
import { Modal, Pill } from "./ui";

export default function InventoryCountModal({ items, prices, onClose, onSaved }) {
  const [countDate, setCountDate] = useState(todayISO());
  const [counts, setCounts] = useState({}); // item_id -> entered qty string
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rows = useMemo(() => {
    return items.map((item) => {
      const cost = weightedAvgCost(item.id, prices);
      const entered = counts[item.id];
      const qty = entered !== undefined && entered !== "" ? Number(entered) : item.on_hand_qty;
      const value = qty != null && cost != null ? qty * cost : null;
      return { item, cost, qty, value, touched: entered !== undefined && entered !== "" };
    });
  }, [items, prices, counts]);

  const totalValue = rows.reduce((s, r) => s + (r.value || 0), 0);
  const touchedCount = rows.filter((r) => r.touched).length;

  async function save() {
    setSaving(true);
    setError("");
    try {
      const lines = rows
        .filter((r) => r.touched)
        .map((r) => ({ item_id: r.item.id, quantity: r.qty, unit_cost: r.cost, line_value: r.value }));
      await saveInventoryCount({ countDate, totalValue, lines });
      await onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Couldn't save that count — check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <Modal title="Run inventory count" onClose={onClose} wide>
      <p className="bk-disclaimer" style={{ marginTop: 0 }}>
        Leave an item blank to skip it — it&apos;ll keep its last known on-hand quantity for this count&apos;s total.
        Only items you enter a number for get logged as recounted.
      </p>
      <div className="bk-form-row">
        <div className="bk-field" style={{ maxWidth: 200 }}>
          <span>Count date</span>
          <input className="bk-input" type="date" value={countDate} onChange={(e) => setCountDate(e.target.value)} />
        </div>
      </div>
      <table className="bk-table bk-table-compact">
        <thead><tr><th>Item</th><th>Tag</th><th>Last known</th><th>New count</th><th>Value</th></tr></thead>
        <tbody>
          {rows.map(({ item, cost, value, touched }) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td><Pill tag={item.category_tag} /></td>
              <td>{item.on_hand_qty ?? "never counted"}</td>
              <td>
                <input
                  className="bk-input"
                  type="number"
                  placeholder={item.on_hand_qty != null ? String(item.on_hand_qty) : "—"}
                  value={counts[item.id] ?? ""}
                  onChange={(e) => setCounts({ ...counts, [item.id]: e.target.value })}
                  style={{ width: 90 }}
                />
              </td>
              <td className={touched ? "stat-good" : ""}>
                {value == null ? "needs pricing" : fmtMoney(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bk-drawer-summary" style={{ marginTop: 12 }}>
        Total inventory value: <strong>{fmtMoney(totalValue)}</strong> · {touchedCount} of {items.length} item{items.length === 1 ? "" : "s"} recounted this session
      </div>
      {error && <p className="bk-error-text">{error}</p>}
      <div className="bk-modal-actions">
        <button className="bk-btn-secondary" onClick={onClose}>Cancel</button>
        <button className="bk-btn-primary" disabled={saving || touchedCount === 0} onClick={save}>
          {saving ? "Saving…" : "Save count"}
        </button>
      </div>
    </Modal>
  );
}
