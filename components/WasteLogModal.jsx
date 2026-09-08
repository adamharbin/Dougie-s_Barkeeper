"use client";

import { useState } from "react";
import { insertWasteEntry, updateWasteEntry } from "@/lib/db";
import { Modal, Field, SearchableSelect } from "./ui";

const CATEGORIES = ["Spoilage/Expired", "Over-prep", "Breakage/Spill", "Comp/Mistake", "Other"];

function blankForm(entry) {
  return {
    item_id: entry?.item_id || "",
    waste_date: entry?.waste_date || new Date().toISOString().slice(0, 10),
    category: entry?.category || "Other",
    quantity: entry?.quantity ?? "",
    reason: entry?.reason || "",
  };
}

export default function WasteLogModal({ entry, items, onClose, onSaved }) {
  const isNew = !entry?.id;
  const [form, setForm] = useState(blankForm(entry));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const itemOptions = [...items].sort((a, b) => a.name.localeCompare(b.name)).map((i) => ({ value: i.id, label: i.name }));
  const selectedItem = items.find((i) => i.id === form.item_id);

  async function save() {
    if (!form.item_id) {
      setError("Choose an item.");
      return;
    }
    if (!form.quantity) {
      setError("Enter a quantity.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isNew) await insertWasteEntry(form);
      else await updateWasteEntry(entry.id, form);
      await onSaved();
      onClose();
    } catch (e) {
      console.error("waste entry save failed:", e?.message || e, e);
      setError("Couldn't save — check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? "Log waste" : "Edit waste entry"} onClose={onClose}>
      <Field label="Item">
        <SearchableSelect options={itemOptions} value={form.item_id} onChange={(v) => set("item_id", v)} placeholder="Search items…" />
      </Field>
      <Field label="Date">
        <input className="bk-input" type="date" value={form.waste_date} onChange={(e) => set("waste_date", e.target.value)} />
      </Field>
      <Field label="Category">
        <select className="bk-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label={`Quantity${selectedItem?.recipe_unit ? ` (${selectedItem.recipe_unit})` : ""}`}>
        <input className="bk-input" type="number" step="any" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="0" />
      </Field>
      <Field label="Reason / notes">
        <textarea className="bk-input" rows={2} value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="e.g. dropped tray, past expiration…" />
      </Field>
      {error && <p className="bk-error-text">{error}</p>}
      <div className="bk-modal-actions">
        <button className="bk-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="bk-btn-primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save entry"}
        </button>
      </div>
    </Modal>
  );
}
