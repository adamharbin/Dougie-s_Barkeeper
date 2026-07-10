"use client";

import { useState } from "react";
import { insertItem, updateItem } from "@/lib/db";
import { Modal, Field } from "./ui";

export default function ItemModal({ item, onClose, onSaved }) {
  const isNew = !item?.id;
  const [form, setForm] = useState(
    item || { name: "", category_tag: "Food", unit: "", par_level: "", shelf_life_days: "", recipe_unit: "", units_per_purchase_unit: "1" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
    <Modal title={isNew ? "Add inventory item" : `Edit ${item.name}`} onClose={onClose}>
      <Field label="Name">
        <input className="bk-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Category tag">
        <select className="bk-input" value={form.category_tag} onChange={(e) => set("category_tag", e.target.value)}>
          <option>Food</option>
          <option>Bar</option>
          <option>Shared</option>
        </select>
      </Field>
      <Field label="Unit of measure (e.g. lb, oz, each, bottle)">
        <input className="bk-input" value={form.unit} onChange={(e) => set("unit", e.target.value)} />
      </Field>
      <Field label="Par level (optional)">
        <input className="bk-input" type="number" value={form.par_level} onChange={(e) => set("par_level", e.target.value)} />
      </Field>
      <Field label="Shelf life, in days (for expiration estimate — leave blank if it doesn't expire)">
        <input className="bk-input" type="number" value={form.shelf_life_days} onChange={(e) => set("shelf_life_days", e.target.value)} />
      </Field>
      <div className="bk-form-row">
        <Field label="Recipe unit (optional — e.g. oz, if recipes use a finer unit than above)">
          <input className="bk-input" value={form.recipe_unit} onChange={(e) => set("recipe_unit", e.target.value)} />
        </Field>
        <Field label={`# of recipe units per 1 ${form.unit || "unit"}`}>
          <input className="bk-input" type="number" value={form.units_per_purchase_unit} onChange={(e) => set("units_per_purchase_unit", e.target.value)} />
        </Field>
      </div>
      {error && <p className="bk-error-text">{error}</p>}
      <div className="bk-modal-actions">
        <button className="bk-btn-secondary" onClick={onClose}>Cancel</button>
        <button className="bk-btn-primary" disabled={!form.name.trim() || saving} onClick={save}>
          {saving ? "Saving…" : "Save item"}
        </button>
      </div>
    </Modal>
  );
}
