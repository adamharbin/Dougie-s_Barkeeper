"use client";

import { useRef, useState } from "react";
import { insertItem, insertPrice } from "@/lib/db";
import { todayISO } from "@/lib/costing";
import { Modal, Field, EmptyState } from "./ui";

const NEW_ITEM = "__new__";

function blankRow() {
  return { key: crypto.randomUUID(), matched_item_id: "", name: "", quantity: "", unit: "", cost: "" };
}

function InvoiceReview({ items, vendors, onCancel, onConfirm, saving, error }) {
  const [vendorId, setVendorId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState([blankRow()]);

  function updateRow(key, patch) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, blankRow()]);
  }
  function removeRow(key) {
    setRows((rs) => rs.filter((r) => r.key !== key));
  }

  const validRows = rows.filter((r) => (r.matched_item_id && r.matched_item_id !== NEW_ITEM) || r.name.trim());
  const canConfirm = vendorId && validRows.length > 0 && validRows.every((r) => r.quantity && r.cost);

  return (
    <div className="bk-card">
      <h4>Review before saving</h4>
      <p className="bk-disclaimer">
        Nothing is saved yet. Match each line to an inventory item (or create a new one), fill in quantity and
        cost, then confirm.
      </p>
      <div className="bk-form-row">
        <Field label="Vendor">
          <select className="bk-input" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
            <option value="">Choose vendor…</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </Field>
        <Field label="Invoice / delivery date">
          <input className="bk-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <table className="bk-table bk-table-compact">
        <thead><tr><th>Matched to</th><th>Qty</th><th>Unit</th><th>Cost/unit</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>
                <select
                  className="bk-input"
                  value={r.matched_item_id}
                  onChange={(e) => updateRow(r.key, { matched_item_id: e.target.value })}
                >
                  <option value="">Choose…</option>
                  <option value={NEW_ITEM}>+ New item</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                {r.matched_item_id === NEW_ITEM && (
                  <input
                    className="bk-input"
                    style={{ marginTop: 6 }}
                    placeholder="New item name"
                    value={r.name}
                    onChange={(e) => updateRow(r.key, { name: e.target.value })}
                  />
                )}
              </td>
              <td><input className="bk-input" type="number" value={r.quantity} onChange={(e) => updateRow(r.key, { quantity: e.target.value })} /></td>
              <td><input className="bk-input" value={r.unit} onChange={(e) => updateRow(r.key, { unit: e.target.value })} /></td>
              <td><input className="bk-input" type="number" value={r.cost} onChange={(e) => updateRow(r.key, { cost: e.target.value })} /></td>
              <td><button className="bk-link bk-link-danger" onClick={() => removeRow(r.key)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="bk-link" onClick={addRow}>+ Add line</button>
      {error && <p className="bk-error-text">{error}</p>}
      <div className="bk-modal-actions">
        <button className="bk-btn-secondary" onClick={onCancel}>Discard</button>
        <button className="bk-btn-primary" disabled={!canConfirm || saving} onClick={() => onConfirm({ vendorId, date, rows: validRows })}>
          {saving ? "Saving…" : "Confirm & save"}
        </button>
      </div>
    </div>
  );
}

export default function UploadInvoiceModal({ items, vendors, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | review
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(fileList) {
    const f = fileList && fileList[0];
    if (f) setFile(f);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  async function confirm({ vendorId, date, rows }) {
    setSaving(true);
    setError("");
    try {
      for (const r of rows) {
        let itemId = r.matched_item_id;
        if (itemId === NEW_ITEM) {
          const created = await insertItem({ name: r.name, category_tag: "Food", unit: r.unit, par_level: "", shelf_life_days: "" });
          itemId = created.id;
        }
        await insertPrice({
          item_id: itemId,
          vendor_id: vendorId,
          purchase_date: date,
          checked_in_date: date,
          quantity: r.quantity,
          unit: r.unit,
          cost: r.cost,
          source: "upload",
        });
      }
      await onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Couldn't save that invoice — check your connection and try again.");
      setSaving(false);
    }
  }

  if (status === "review") {
    return (
      <Modal title="Review invoice" onClose={onClose} wide>
        <InvoiceReview items={items} vendors={vendors} onCancel={onClose} onConfirm={confirm} saving={saving} error={error} />
      </Modal>
    );
  }

  return (
    <Modal title="Upload invoice" onClose={onClose} wide>
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
          accept="image/*,application/pdf"
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
      <div className="bk-or">— or —</div>
      <Field label="Paste invoice text">
        <textarea
          className="bk-input"
          rows={5}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste invoice line items…"
        />
      </Field>
      <p className="bk-disclaimer" style={{ marginTop: 0 }}>
        Automatic photo/PDF/text parsing isn&apos;t connected yet — continuing takes you to a manual entry screen
        where you can add each line item by hand. Nothing is saved until you confirm.
      </p>
      {items.length === 0 && <EmptyState text="No inventory items yet." sub="You can still create new ones from the review screen." />}
      <div className="bk-modal-actions">
        <button className="bk-btn-secondary" onClick={onClose}>Cancel</button>
        <button className="bk-btn-primary" onClick={() => setStatus("review")}>Continue to manual entry</button>
      </div>
    </Modal>
  );
}
