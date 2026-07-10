"use client";

import { useRef, useState } from "react";
import { Modal, Field } from "./ui";
import RecipeModal from "./RecipeModal";

export default function UploadRecipeModal({ items, prices, settings, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | review

  function handleFiles(fileList) {
    const f = fileList && fileList[0];
    if (f) setFile(f);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  if (status === "review") {
    return (
      <RecipeModal
        recipe={null}
        items={items}
        prices={prices}
        settings={settings}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
  }

  return (
    <Modal title="Upload recipe" onClose={onClose} wide>
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
      <Field label="Paste the recipe">
        <textarea
          className="bk-input"
          rows={5}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste the recipe…"
        />
      </Field>
      <p className="bk-disclaimer" style={{ marginTop: 0 }}>
        Automatic photo/PDF/text parsing isn&apos;t connected yet — continuing takes you to the regular recipe form
        to enter it by hand. Nothing is saved until you confirm there.
      </p>
      <div className="bk-modal-actions">
        <button className="bk-btn-secondary" onClick={onClose}>Cancel</button>
        <button className="bk-btn-primary" onClick={() => setStatus("review")}>Continue to manual entry</button>
      </div>
    </Modal>
  );
}
