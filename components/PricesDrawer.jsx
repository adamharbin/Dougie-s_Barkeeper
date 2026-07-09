"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { insertPrice, deletePrice } from "@/lib/db";
import { weightedAvgCost, fmtMoney, fmtDate, todayISO } from "@/lib/costing";
import { Modal, EmptyState } from "./ui";

export default function PricesDrawer({ item, prices, allPrices, vendors, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({
    vendor_id: "",
    purchase_date: todayISO(),
    checked_in_date: todayISO(),
    quantity: "",
    unit: item.unit || "",
    cost: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function addEntry() {
    if (!form.quantity || !form.cost) return;
    setSaving(true);
    setError("");
    try {
      await insertPrice({ ...form, item_id: item.id, source: "manual" });
      await onSaved();
      setForm({ ...form, quantity: "", cost: "" });
    } catch (e) {
      console.error(e);
      setError("Couldn't log that purchase — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry(id) {
    if (!isAdmin) return;
    try {
      await deletePrice(id);
      await onSaved();
    } catch (e) {
      console.error(e);
      setError("Couldn't remove that entry — check your connection and try again.");
    }
  }

  const avg = weightedAvgCost(item.id, allPrices);

  return (
    <Modal title={`Purchase history — ${item.name}`} onClose={onClose} wide>
      <div className="bk-drawer-summary">
        Weighted average cost: <strong>{avg == null ? "needs pricing" : `${fmtMoney(avg)} / ${item.unit || "unit"}`}</strong>
      </div>
      <table className="bk-table bk-table-compact">
        <thead>
          <tr><th>Date</th><th>Vendor</th><th>Qty</th><th>Unit</th><th>Cost/unit</th><th>Checked in</th><th></th></tr>
        </thead>
        <tbody>
          {prices.length === 0 && (
            <tr><td colSpan={7}><EmptyState text="No purchases logged yet." /></td></tr>
          )}
          {[...prices].sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)).map((e) => (
            <tr key={e.id}>
              <td>{fmtDate(e.purchase_date)}</td>
              <td>{vendors.find((v) => v.id === e.vendor_id)?.name || "—"}</td>
              <td>{e.quantity}</td>
              <td>{e.unit}</td>
              <td>{fmtMoney(e.cost)}</td>
              <td>{fmtDate(e.checked_in_date)}</td>
              <td>{isAdmin && <button className="bk-link bk-link-danger" onClick={() => removeEntry(e.id)}>Remove</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 className="bk-subhead">Log a purchase</h4>
      <div className="bk-inline-form">
        <select className="bk-input" value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}>
          <option value="">Vendor…</option>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <input className="bk-input" type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
        <input className="bk-input" type="number" placeholder="Qty" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        <input className="bk-input" placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        <input className="bk-input" type="number" placeholder="Cost/unit" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
        <input className="bk-input" type="date" value={form.checked_in_date} onChange={(e) => setForm({ ...form, checked_in_date: e.target.value })} title="Checked-in date" />
        <button className="bk-btn-primary" disabled={saving} onClick={addEntry}>{saving ? "Logging…" : "Log purchase"}</button>
      </div>
      {error && <p className="bk-error-text">{error}</p>}
    </Modal>
  );
}
