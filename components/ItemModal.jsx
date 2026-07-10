"use client";

import { useState } from "react";
import { insertItem, updateItem } from "@/lib/db";
import { recipeUnitsPerPurchaseUnit, unitConversionFactor, MENU_CATEGORIES } from "@/lib/costing";
import { Modal, Field } from "./ui";

function blankForm() {
  return {
    name: "",
    category_tag: "Food",
    menu_category: "",
    par_level: "",
    shelf_life_days: "",
    recipe_unit: "",
    purchase_unit: "",
    pack_qty: "1",
    inner_unit_label: "",
    size_per_inner: "1",
    size_uom: "",
    manual_factor: "",
  };
}

export default function ItemModal({ item, onClose, onSaved }) {
  const isNew = !item?.id;
  const [form, setForm] = useState(item || blankForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const autoFactor = unitConversionFactor(form.size_uom, form.recipe_unit);
  const needsManualFactor = form.size_uom && form.recipe_unit && autoFactor == null;
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

  return (
    <Modal title={isNew ? "Add inventory item" : `Edit ${item.name}`} onClose={onClose} wide>
      <Field label="Name">
        <input className="bk-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <div className="bk-form-row">
        <Field label="Category tag">
          <select className="bk-input" value={form.category_tag} onChange={(e) => set("category_tag", e.target.value)}>
            <option>Food</option>
            <option>Bar</option>
            <option>Shared</option>
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

      <h4 className="bk-subhead">Recipe unit</h4>
      <p className="bk-disclaimer" style={{ marginTop: 0 }}>
        The fine-grained unit recipes will measure this ingredient in (e.g. oz, ml, each).
      </p>
      <Field label="Recipe unit">
        <input className="bk-input" placeholder="e.g. oz" value={form.recipe_unit} onChange={(e) => set("recipe_unit", e.target.value)} />
      </Field>

      <h4 className="bk-subhead">How you buy it</h4>
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
    </Modal>
  );
}
