"use client";

import { useState } from "react";
import { insertVendor, updateVendor } from "@/lib/db";
import { Modal, Field } from "./ui";

export default function VendorModal({ vendor, onClose, onSaved }) {
  const isNew = !vendor?.id;
  const [form, setForm] = useState(
    vendor || { name: "", contact_name: "", contact_method: "", order_deadline: "", delivery_days: "", supplies_notes: "" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setError("");
    try {
      if (isNew) await insertVendor(form);
      else await updateVendor(vendor.id, form);
      await onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Couldn't save that vendor — check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? "Add vendor" : `Edit ${vendor.name}`} onClose={onClose}>
      <Field label="Name">
        <input className="bk-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Contact person">
        <input className="bk-input" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
      </Field>
      <Field label="Contact method (phone/email/portal)">
        <input className="bk-input" value={form.contact_method} onChange={(e) => set("contact_method", e.target.value)} />
      </Field>
      <Field label="Order deadline (day + time)">
        <input className="bk-input" value={form.order_deadline} onChange={(e) => set("order_deadline", e.target.value)} placeholder="e.g. Tue 2pm" />
      </Field>
      <Field label="Delivery day(s)">
        <input className="bk-input" value={form.delivery_days} onChange={(e) => set("delivery_days", e.target.value)} placeholder="e.g. Thu, Sat" />
      </Field>
      <Field label="What they supply">
        <textarea className="bk-input" rows={2} value={form.supplies_notes} onChange={(e) => set("supplies_notes", e.target.value)} />
      </Field>
      {error && <p className="bk-error-text">{error}</p>}
      <div className="bk-modal-actions">
        <button className="bk-btn-secondary" onClick={onClose}>Cancel</button>
        <button className="bk-btn-primary" disabled={!form.name.trim() || saving} onClick={save}>
          {saving ? "Saving…" : "Save vendor"}
        </button>
      </div>
    </Modal>
  );
}
