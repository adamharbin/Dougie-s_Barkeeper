"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { insertItem, updateItem, insertPrice, updatePrice, deletePrice } from "@/lib/db";
import { recipeUnitsPerPurchaseUnit, unitConversionFactor, weightedAvgCost, fmtMoney, fmtDate, todayISO, MENU_CATEGORIES } from "@/lib/costing";
import { Modal, Field, EmptyState } from "./ui";

// Defaults match "count" mode (the common case new items start on) so the
// hidden recipe_unit/size_uom are already correct if the user never touches
// the mode toggle at all.
function blankForm() {
  return {
    name: "",
    category_tag: "Food",
    menu_category: "",
    par_level: "",
    shelf_life_days: "",
    recipe_unit: "each",
    purchase_unit: "",
    pack_qty: "1",
    inner_unit_label: "",
    size_per_inner: "1",
    size_uom: "each",
    manual_factor: "",
  };
}

// New items default to "count" (the common case). Existing items are
// detected as "count" or "weight" only if their fields exactly match what
// the quick-setup flow itself would have produced — anything else (bottles,
// volumes, a manual factor already set) opens in "advanced" untouched.
function detectPackagingMode(item) {
  if (!item?.id) return "count";
  const su = (item.size_uom || "").toLowerCase();
  const ru = (item.recipe_unit || "").toLowerCase();
  const spi = Number(item.size_per_inner ?? 1);
  const hasManual = item.manual_factor !== null && item.manual_factor !== undefined && item.manual_factor !== "";
  if (hasManual || spi !== 1) return "advanced";
  if ((ru === "each" || ru === "ea") && (su === "each" || su === "ea")) return "count";
  if (ru === "oz" && su === "lb") return "weight";
  return "advanced";
}

function blankPriceForm(item) {
  return {
    vendor_id: "",
    purchase_date: todayISO(),
    checked_in_date: todayISO(),
    purchase_unit: item.purchase_unit || "",
    qty_purchased: "",
    cost_per_purchase_unit: "",
  };
}

function priceFormFromEntry(entry) {
  return {
    vendor_id: entry.vendor_id || "",
    purchase_date: entry.purchase_date || todayISO(),
    checked_in_date: entry.checked_in_date || todayISO(),
    purchase_unit: entry.purchase_unit || "",
    qty_purchased: String(entry.qty_purchased ?? ""),
    cost_per_purchase_unit: String(entry.cost_per_purchase_unit ?? ""),
  };
}

export default function ItemModal({ item, prices, vendors, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const isNew = !item?.id;
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState(item || blankForm());
  const [mode, setMode] = useState(detectPackagingMode(item));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const [priceForm, setPriceForm] = useState(isNew ? null : blankPriceForm(item));
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingSnapshot, setEditingSnapshot] = useState(null);
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceError, setPriceError] = useState("");

  function chooseMode(m) {
    setMode(m);
    if (m === "count") {
      setForm((f) => ({ ...f, recipe_unit: "each", size_per_inner: "1", size_uom: "each", manual_factor: "" }));
    } else if (m === "weight") {
      setForm((f) => ({ ...f, recipe_unit: "oz", size_per_inner: "1", size_uom: "lb", manual_factor: "" }));
    }
  }

  const autoFactor = unitConversionFactor(form.size_uom, form.recipe_unit);
  const needsManualFactor = mode === "advanced" && form.size_uom && form.recipe_unit && autoFactor == null;
  const perPurchaseUnit = recipeUnitsPerPurchaseUnit(form);

  async function save() {
    setSaving(true);
    setError("");
    try {
      if (isNew) await insertItem(form);
      else await updateItem(item.id, form);
      await onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Couldn't save that item — check your connection and try again.");
      setSaving(false);
    }
  }

  // ---- purchase history (only relevant once the item exists) ----
  const itemPrices = isNew ? [] : prices.filter((p) => p.item_id === item.id);
  const avg = isNew ? null : weightedAvgCost(item.id, prices);
  const currentSnapshot = isNew ? null : recipeUnitsPerPurchaseUnit(item);
  const priceSnapshot = editingPriceId ? editingSnapshot : currentSnapshot;
  const qtyPurchased = Number(priceForm?.qty_purchased) || 0;
  const costPerPurchaseUnit = Number(priceForm?.cost_per_purchase_unit) || 0;
  const totalCost = qtyPurchased * costPerPurchaseUnit;
  const recipeUnitsReceived = priceSnapshot != null ? qtyPurchased * priceSnapshot : null;
  const costPerRecipeUnit = recipeUnitsReceived ? totalCost / recipeUnitsReceived : null;

  function startEditPrice(entry) {
    if (!isAdmin) return;
    setEditingPriceId(entry.id);
    setEditingSnapshot(entry.recipe_units_per_purchase_unit_snapshot ?? null);
    setPriceForm(priceFormFromEntry(entry));
    setPriceError("");
  }

  function cancelEditPrice() {
    setEditingPriceId(null);
    setEditingSnapshot(null);
    setPriceForm(blankPriceForm(item));
    setPriceError("");
  }

  async function savePrice() {
    if (!priceForm.qty_purchased || !priceForm.cost_per_purchase_unit || priceSnapshot == null) return;
    setPriceSaving(true);
    setPriceError("");
    try {
      const payload = { ...priceForm, recipe_units_per_purchase_unit_snapshot: priceSnapshot };
      if (editingPriceId) {
        await updatePrice(editingPriceId, payload);
      } else {
        await insertPrice({ ...payload, item_id: item.id, source: "manual" });
      }
      await onSaved();
      if (editingPriceId) {
        cancelEditPrice();
      } else {
        setPriceForm({ ...blankPriceForm(item), vendor_id: priceForm.vendor_id, purchase_date: priceForm.purchase_date, checked_in_date: priceForm.checked_in_date });
      }
    } catch (e) {
      console.error(e);
      setPriceError(`Couldn't ${editingPriceId ? "save" : "log"} that purchase — check your connection and try again.`);
    } finally {
      setPriceSaving(false);
    }
  }

  async function removePrice(id) {
    if (!isAdmin) return;
    try {
      await deletePrice(id);
      if (editingPriceId === id) cancelEditPrice();
      await onSaved();
    } catch (e) {
      console.error(e);
      setPriceError("Couldn't remove that entry — check your connection and try again.");
    }
  }

  return (
    <Modal title={isNew ? "Add inventory item" : item.name} onClose={onClose} wide>
      {!isNew && (
        <div className="bk-toolbar">
          <button className={`bk-subtab ${tab === "details" ? "active" : ""}`} onClick={() => setTab("details")}>Details</button>
          <button className={`bk-subtab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>Purchase History</button>
        </div>
      )}

      {tab === "details" ? (
        <>
          <Field label="Name">
            <input className="bk-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <div className="bk-form-row">
            <Field label="Category tag">
              <select className="bk-input" value={form.category_tag} onChange={(e) => set("category_tag", e.target.value)}>
                <option>Food</option>
                <option>Bar</option>
                <option>Shared</option>
                <option>Supplies</option>
                <option>Packaging</option>
              </select>
            </Field>
            <Field label="Par level (optional)">
              <input className="bk-input" type="number" value={form.par_level} onChange={(e) => set("par_level", e.target.value)} />
            </Field>
            <Field label="Shelf life, in days (leave blank if it doesn't expire)">
              <input className="bk-input" type="number" value={form.shelf_life_days} onChange={(e) => set("shelf_life_days", e.target.value)} />
            </Field>
          </div>
          <Field label="Menu category (optional — for filtering)">
            <select className="bk-input" value={form.menu_category || ""} onChange={(e) => set("menu_category", e.target.value)}>
              <option value="">— Uncategorized —</option>
              {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <h4 className="bk-subhead">How you buy it</h4>
          <div className="bk-toolbar">
            <button className={`bk-subtab ${mode === "count" ? "active" : ""}`} onClick={() => chooseMode("count")}>Count</button>
            <button className={`bk-subtab ${mode === "weight" ? "active" : ""}`} onClick={() => chooseMode("weight")}>Weight (lbs → oz)</button>
            <button className={`bk-subtab ${mode === "advanced" ? "active" : ""}`} onClick={() => chooseMode("advanced")}>Advanced</button>
          </div>

          {(mode === "count" || mode === "weight") && (
            <div className="bk-form-row">
              <Field label="What do you call this package? (e.g. Case, Box, Bag)">
                <input className="bk-input" placeholder="Case" value={form.purchase_unit} onChange={(e) => set("purchase_unit", e.target.value)} />
              </Field>
              <Field label={mode === "count" ? "How many per case?" : "How many lbs per case?"}>
                <input className="bk-input" type="number" value={form.pack_qty} onChange={(e) => set("pack_qty", e.target.value)} />
              </Field>
            </div>
          )}

          {mode === "advanced" && (
            <>
              <p className="bk-disclaimer" style={{ marginTop: 0 }}>
                The fine-grained unit recipes will measure this ingredient in (e.g. oz, ml, each).
              </p>
              <Field label="Recipe unit">
                <input className="bk-input" placeholder="e.g. oz" value={form.recipe_unit} onChange={(e) => set("recipe_unit", e.target.value)} />
              </Field>
              <div className="bk-form-row">
                <Field label="Purchase unit">
                  <input className="bk-input" placeholder="e.g. Case" value={form.purchase_unit} onChange={(e) => set("purchase_unit", e.target.value)} />
                </Field>
                <Field label="Pack qty (inner containers per purchase unit)">
                  <input className="bk-input" type="number" value={form.pack_qty} onChange={(e) => set("pack_qty", e.target.value)} />
                </Field>
                <Field label="Inner unit label (optional, e.g. bottle)">
                  <input className="bk-input" value={form.inner_unit_label} onChange={(e) => set("inner_unit_label", e.target.value)} />
                </Field>
              </div>
              <div className="bk-form-row">
                <Field label="Size per inner container">
                  <input className="bk-input" type="number" value={form.size_per_inner} onChange={(e) => set("size_per_inner", e.target.value)} />
                </Field>
                <Field label="Size unit (usually same as recipe unit)">
                  <input className="bk-input" placeholder="e.g. oz" value={form.size_uom} onChange={(e) => set("size_uom", e.target.value)} />
                </Field>
              </div>

              {needsManualFactor && (
                <>
                  <p className="bk-error-text">
                    {form.size_uom} and {form.recipe_unit} don&apos;t auto-convert (different kinds of measurement). Enter
                    how many {form.recipe_unit} are in 1 {form.size_uom} manually below.
                  </p>
                  <Field label={`${form.recipe_unit || "recipe units"} per 1 ${form.size_uom || "size unit"}`}>
                    <input className="bk-input" type="number" value={form.manual_factor} onChange={(e) => set("manual_factor", e.target.value)} />
                  </Field>
                </>
              )}
            </>
          )}

          {form.recipe_unit && form.purchase_unit && (
            <div className="bk-field">
              <span>Result</span>
              <div className="bk-computed-value">
                {perPurchaseUnit == null ? (
                  <span className="bk-needs-pricing">Add the missing details above to calculate this</span>
                ) : (
                  `→ ${perPurchaseUnit} ${form.recipe_unit} per ${form.purchase_unit}`
                )}
              </div>
            </div>
          )}

          {error && <p className="bk-error-text">{error}</p>}
          <div className="bk-modal-actions">
            <button className="bk-btn-secondary" onClick={onClose}>Cancel</button>
            <button
              className="bk-btn-primary"
              disabled={!form.name.trim() || (needsManualFactor && !form.manual_factor) || saving}
              onClick={save}
            >
              {saving ? "Saving…" : "Save item"}
            </button>
          </div>
        </>
      ) : (
        <>
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
              {itemPrices.length === 0 && (
                <tr><td colSpan={9}><EmptyState text="No purchases logged yet." /></td></tr>
              )}
              {[...itemPrices].sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)).map((e) => (
                <tr key={e.id} className={editingPriceId === e.id ? "bk-row-flag" : ""}>
                  <td>{fmtDate(e.purchase_date)}</td>
                  <td>{vendors.find((v) => v.id === e.vendor_id)?.name || "—"}</td>
                  <td>{e.qty_purchased} × {e.purchase_unit || "—"}</td>
                  <td>{e.quantity} {item.recipe_unit}</td>
                  <td>{fmtMoney(e.cost_per_purchase_unit)}</td>
                  <td>{fmtMoney((e.cost_per_purchase_unit || 0) * (e.qty_purchased || 0))}</td>
                  <td>{fmtMoney(e.cost)}</td>
                  <td>{fmtDate(e.checked_in_date)}</td>
                  <td className="bk-row-actions">
                    {isAdmin && <button className="bk-link" onClick={() => startEditPrice(e)}>Edit</button>}
                    {isAdmin && <button className="bk-link bk-link-danger" onClick={() => removePrice(e.id)}>Remove</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4 className="bk-subhead">{editingPriceId ? "Edit purchase" : "Log a purchase"}</h4>
          {currentSnapshot == null && !editingPriceId && (
            <p className="bk-error-text">
              This item&apos;s unit setup isn&apos;t complete yet — finish the Details tab before logging a purchase.
            </p>
          )}
          <div className="bk-inline-form">
            <select className="bk-input" value={priceForm.vendor_id} onChange={(e) => setPriceForm({ ...priceForm, vendor_id: e.target.value })}>
              <option value="">Vendor…</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <input className="bk-input" type="date" value={priceForm.purchase_date} onChange={(e) => setPriceForm({ ...priceForm, purchase_date: e.target.value })} />
            <input className="bk-input" placeholder="Purchase unit (e.g. Case)" value={priceForm.purchase_unit} onChange={(e) => setPriceForm({ ...priceForm, purchase_unit: e.target.value })} />
            <input className="bk-input" type="number" placeholder="Qty purchased" value={priceForm.qty_purchased} onChange={(e) => setPriceForm({ ...priceForm, qty_purchased: e.target.value })} />
            <input className="bk-input" type="number" placeholder="Cost/purchase unit" value={priceForm.cost_per_purchase_unit} onChange={(e) => setPriceForm({ ...priceForm, cost_per_purchase_unit: e.target.value })} />
            <input className="bk-input" type="date" value={priceForm.checked_in_date} onChange={(e) => setPriceForm({ ...priceForm, checked_in_date: e.target.value })} title="Checked-in date" />
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
            <button className="bk-btn-primary" disabled={priceSaving || priceSnapshot == null} onClick={savePrice}>
              {priceSaving ? "Saving…" : editingPriceId ? "Save changes" : "Log purchase"}
            </button>
            {editingPriceId && <button className="bk-btn-secondary" onClick={cancelEditPrice}>Cancel</button>}
          </div>
          {priceError && <p className="bk-error-text">{priceError}</p>}
          <div className="bk-modal-actions">
            <button className="bk-btn-secondary" onClick={onClose}>Close</button>
          </div>
        </>
      )}
    </Modal>
  );
}
