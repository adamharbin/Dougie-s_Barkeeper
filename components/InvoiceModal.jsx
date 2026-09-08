"use client";

import { useRef, useState } from "react";
import { insertInvoice, updateInvoice, uploadInvoiceFile } from "@/lib/db";
import { Modal, Field } from "./ui";

function blankForm(invoice) {
  return {
    vendor_id: invoice?.vendor_id || "",
    invoice_date: invoice?.invoice_date || new Date().toISOString().slice(0, 10),
    total_amount: invoice?.total_amount ?? "",
    notes: invoice?.notes || "",
  };
}

export default function InvoiceModal({ invoice, vendors, onClose, onSaved }) {
  const isNew = !invoice?.id;
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(blankForm(invoice));
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function handleFiles(fileList) {
    const f = fileList && fileList[0];
    if (f) setFile(f);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  async function save() {
    if (isNew && !file) {
      setError("Choose a file to upload.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        const path = await uploadInvoiceFile(file);
        await insertInvoice({ ...form, file_path: path, file_name: file.name });
      } else {
        await updateInvoice(invoice.id, form);
      }
      await onSaved();
      onClose();
    } catch (e) {
      console.error("invoice save failed:", e?.message || e, e);
      setError("Couldn't save — check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <Modal title={isNew ? "Upload invoice" : `Edit invoice — ${invoice.file_name || "file"}`} onClose={onClose}>
      {isNew && (
        <Field label="File (PDF or photo)">
          <div
            className={`bk-dropzone ${dragOver ? "bk-dropzone-active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            {file ? (
              <div className="bk-dropzone-file">
                📎 {file.name}
                <button className="bk-link" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</button>
              </div>
            ) : (
              <>
                <div className="bk-dropzone-title">Drag & drop a photo or PDF here</div>
                <div className="bk-dropzone-sub">or click to browse</div>
              </>
            )}
          </div>
        </Field>
      )}
      <Field label="Vendor">
        <select className="bk-input" value={form.vendor_id} onChange={(e) => set("vendor_id", e.target.value)}>
          <option value="">— none —</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Invoice date">
        <input className="bk-input" type="date" value={form.invoice_date} onChange={(e) => set("invoice_date", e.target.value)} />
      </Field>
      <Field label="Total amount">
        <input className="bk-input" type="number" step="0.01" value={form.total_amount} onChange={(e) => set("total_amount", e.target.value)} placeholder="0.00" />
      </Field>
      <Field label="Notes">
        <textarea className="bk-input" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </Field>
      {error && <p className="bk-error-text">{error}</p>}
      <div className="bk-modal-actions">
        <button className="bk-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="bk-btn-primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save invoice"}
        </button>
      </div>
    </Modal>
  );
}
