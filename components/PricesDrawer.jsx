"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { insertPrice, updatePrice, deletePrice } from "@/lib/db";
import { weightedAvgCost, recipeUnitsPerPurchaseUnit, fmtMoney, fmtDate, todayISO } from "@/lib/costing";
import { Modal, EmptyState } from "./ui";

function blankForm(item) {
  return {
    vendor_id: "",
    purchase_date: todayISO(),
    checked_in_date: todayISO(),
    purchase_unit: item.purchase_unit || "",
    qty_purchased: "",
    cost_per_purchase_unit: "",
  };
}

function formFromEntry(entry) {
  return {
    vendor_id: entry.vendor_id || "",
    purchase_date: entry.purchase_date || todayISO(),
    checked_in_date: entry.checked_in_date || todayISO(),
    purchase_unit: entry.purchase_unit || "",
    qty_purchased: String(entry.qty_purchased ?? ""),
    cost_per_purchase_unit: String(entry.cost_per_purchase_unit ?? ""),
  };
}

export default function PricesDrawer({ item, prices, allPrices, vendors, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState(blankForm(item));
  const [editingId, setEditingId] = useState(null);
  const [editingSnapshot, setEditingSnapshot] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // New entries always use the item's CURRENT unit setup. Edits keep the
  // original entry's snapshot untouched — never recomputed from the item.
  const currentSnapshot = recipeUnitsPerPurchaseUnit(item);
  const snapshot = editingId ? editingSnapshot : currentSnapshot;

  const qtyPurchased = Number(form.qty_purchased) || 0;
  const costPerPurchaseUnit = Number(form.cost_per_purchase_unit) || 0;
  const totalCost = qtyPurchased * costPerPurchaseUnit;
  const recipeUnitsReceived = snapshot != null ? qtyPurchased * snapshot : null;
  const costPerRecipeUnit = recipeUnitsReceived ? totalCost / recipeUnitsReceived : null;

  function startEdit(entry) {
    if (!isAdmin) return;
    setEditingId(entry.id);
    setEditingSnapshot(entry.recipe_units_per_purchase_unit_snapshot ?? null);
    setForm(formFromEntry(entry));
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingSnapshot(null);
    setForm(blankForm(item));
    setError("");
  }

  async function save() {
    if (!form.qty_purchased || !form.cost_per_purchase_unit || snapshot == null) return;
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, recipe_units_per_purchase_unit_snapshot: snapshot };
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
        Weighted average cost: <strong>{avg == null ? "needs pricing" : `${fmtMoney(avg)} / ${item.recipe_unit || "unit"}`}</strong>
      </div>
      <table className="bk-table bk-table-compact">
        <thead>
          <tr>
            <th>Date</th><th>Vendor</th><th>Purchase</th><th>Received</th>
            <th>Cost/purchase unit</th><th>Total cost</th><th>Cost/recipe unit</th><th>Checked in</th><th></th>
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
              <td>{e.qty_purchased} × {e.purchase_unit || "—"}</td>
              <td>{e.quantity} {item.recipe_unit}</td>
              <td>{fmtMoney(e.cost_per_purchase_unit)}</td>
              <td>{fmtMoney((e.cost_per_purchase_unit || 0) * (e.qty_purchased || 0))}</td>
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
      {currentSnapshot == null && !editingId && (
        <p className="bk-error-text">
          This item&apos;s unit setup isn&apos;t complete yet — set its Recipe unit and Purchase unit details
          (Edit item) before logging a purchase.
        </p>
      )}
      <div className="bk-inline-form">
        <select className="bk-input" value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}>
          <option value="">Vendor…</option>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <input className="bk-input" type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
        <input className="bk-input" placeholder="Purchase unit (e.g. Case)" value={form.purchase_unit} onChange={(e) => setForm({ ...form, purchase_unit: e.target.value })} />
        <input className="bk-input" type="number" placeholder="Qty purchased" value={form.qty_purchased} onChange={(e) => setForm({ ...form, qty_purchased: e.target.value })} />
        <input className="bk-input" type="number" placeholder="Cost/purchase unit" value={form.cost_per_purchase_unit} onChange={(e) => setForm({ ...form, cost_per_purchase_unit: e.target.value })} />
        <input className="bk-input" type="date" value={form.checked_in_date} onChange={(e) => setForm({ ...form, checked_in_date: e.target.value })} title="Checked-in date" />
        <div className="bk-field" style={{ minWidth: 100 }}>
          <span>Total cost</span>
          <div className="bk-computed-value">{fmtMoney(totalCost)}</div>
        </div>
        <div className="bk-field" style={{ minWidth: 130 }}>
          <span>{item.recipe_unit || "Recipe units"} received</span>
          <div className="bk-computed-value">{recipeUnitsReceived == null ? "—" : recipeUnitsReceived}</div>
        </div>
        <div className="bk-field" style={{ minWidth: 110 }}>
          <span>Cost/{item.recipe_unit || "unit"}</span>
          <div className="bk-computed-value">{costPerRecipeUnit == null ? "—" : fmtMoney(costPerRecipeUnit)}</div>
        </div>
        <button className="bk-btn-primary" disabled={saving || snapshot == null} onClick={save}>
          {saving ? "Saving…" : editingId ? "Save changes" : "Log purchase"}
        </button>
        {editingId && <button className="bk-btn-secondary" onClick={cancelEdit}>Cancel</button>}
      </div>
      {error && <p className="bk-error-text">{error}</p>}
    </Modal>
  );
}
