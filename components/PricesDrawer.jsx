"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { insertPrice, updatePrice, deletePrice } from "@/lib/db";
import { weightedAvgCost, fmtMoney, fmtDate, todayISO } from "@/lib/costing";
import { Modal, EmptyState } from "./ui";

function blankForm(item) {
  return {
    vendor_id: "",
    purchase_date: todayISO(),
    checked_in_date: todayISO(),
    case_quantity: "",
    units_per_case: "1",
    unit: item.unit || "",
    total_cost: "",
  };
}

function formFromEntry(entry) {
  const cases = entry.case_quantity ?? entry.quantity ?? "";
  const perCase = entry.units_per_case ?? 1;
  return {
    vendor_id: entry.vendor_id || "",
    purchase_date: entry.purchase_date || todayISO(),
    checked_in_date: entry.checked_in_date || todayISO(),
    case_quantity: String(cases),
    units_per_case: String(perCase),
    unit: entry.unit || "",
    total_cost: String((entry.cost || 0) * (entry.quantity || 0)),
  };
}

export default function PricesDrawer({ item, prices, allPrices, vendors, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState(blankForm(item));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalUnits = (Number(form.case_quantity) || 0) * (Number(form.units_per_case) || 0);
  const costPerUnit = totalUnits > 0 ? Number(form.total_cost || 0) / totalUnits : null;

  function startEdit(entry) {
    if (!isAdmin) return;
    setEditingId(entry.id);
    setForm(formFromEntry(entry));
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(blankForm(item));
    setError("");
  }

  async function save() {
    if (!form.case_quantity || !form.units_per_case || !form.total_cost || !totalUnits) return;
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, quantity: totalUnits, cost: costPerUnit };
      if (editingId) {
        await updatePrice(editingId, payload);
      } else {
        await insertPrice({ ...payload, item_id: item.id, source: "manual" });
      }
      await onSaved();
      if (editingId) {
        cancelEdit();
      } else {
        setForm({ ...blankForm(item), vendor_id: form.vendor_id, purchase_date: form.purchase_date, checked_in_date: form.checked_in_date });
      }
    } catch (e) {
      console.error(e);
      setError(`Couldn't ${editingId ? "save" : "log"} that purchase — check your connection and try again.`);
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry(id) {
    if (!isAdmin) return;
    try {
      await deletePrice(id);
      if (editingId === id) cancelEdit();
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
          <tr>
            <th>Date</th><th>Vendor</th><th>Cases</th><th>Units/case</th><th>Total units</th>
            <th>Total cost</th><th>Cost/unit</th><th>Checked in</th><th></th>
          </tr>
        </thead>
        <tbody>
          {prices.length === 0 && (
            <tr><td colSpan={9}><EmptyState text="No purchases logged yet." /></td></tr>
          )}
          {[...prices].sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)).map((e) => (
            <tr key={e.id} className={editingId === e.id ? "bk-row-flag" : ""}>
              <td>{fmtDate(e.purchase_date)}</td>
              <td>{vendors.find((v) => v.id === e.vendor_id)?.name || "—"}</td>
              <td>{e.case_quantity ?? "—"}</td>
              <td>{e.units_per_case ?? "—"}</td>
              <td>{e.quantity} {e.unit}</td>
              <td>{fmtMoney((e.cost || 0) * (e.quantity || 0))}</td>
              <td>{fmtMoney(e.cost)}</td>
              <td>{fmtDate(e.checked_in_date)}</td>
              <td className="bk-row-actions">
                {isAdmin && <button className="bk-link" onClick={() => startEdit(e)}>Edit</button>}
                {isAdmin && <button className="bk-link bk-link-danger" onClick={() => removeEntry(e.id)}>Remove</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 className="bk-subhead">{editingId ? "Edit purchase" : "Log a purchase"}</h4>
      <div className="bk-inline-form">
        <select className="bk-input" value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}>
          <option value="">Vendor…</option>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <input className="bk-input" type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
        <input className="bk-input" type="number" placeholder="Cases" value={form.case_quantity} onChange={(e) => setForm({ ...form, case_quantity: e.target.value })} />
        <input className="bk-input" type="number" placeholder="Units/case" value={form.units_per_case} onChange={(e) => setForm({ ...form, units_per_case: e.target.value })} />
        <input className="bk-input" placeholder="Unit (e.g. bottle, lb)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        <input className="bk-input" type="number" placeholder="Total cost" value={form.total_cost} onChange={(e) => setForm({ ...form, total_cost: e.target.value })} />
        <input className="bk-input" type="date" value={form.checked_in_date} onChange={(e) => setForm({ ...form, checked_in_date: e.target.value })} title="Checked-in date" />
        <div className="bk-field" style={{ minWidth: 110 }}>
          <span>Total units</span>
          <div className="bk-computed-value">{totalUnits || "—"}</div>
        </div>
        <div className="bk-field" style={{ minWidth: 110 }}>
          <span>Cost/unit</span>
          <div className="bk-computed-value">{costPerUnit == null ? "—" : fmtMoney(costPerUnit)}</div>
        </div>
        <button className="bk-btn-primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : editingId ? "Save changes" : "Log purchase"}
        </button>
        {editingId && <button className="bk-btn-secondary" onClick={cancelEdit}>Cancel</button>}
      </div>
      {error && <p className="bk-error-text">{error}</p>}
    </Modal>
  );
}
