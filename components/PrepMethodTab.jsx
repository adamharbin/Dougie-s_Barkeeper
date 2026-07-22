"use client";

import { useRef, useState } from "react";
import { insertStep, updateStep, deleteStep, uploadStepImage } from "@/lib/db";

function StepCard({ step, index, total, isAdmin, busy, onBlurField, onDelete, onMove, onUpload }) {
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState(step.title || "");
  const [instructions, setInstructions] = useState(step.instructions || "");
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(fileList) {
    const f = fileList && fileList[0];
    if (f) onUpload(step, f);
  }

  return (
    <div className="bk-card bk-step-card">
      <div className="bk-step-card-head">
        <span className="bk-step-badge">Step {index + 1}</span>
        {isAdmin && (
          <div className="bk-step-controls">
            <button className="bk-link" disabled={index === 0} onClick={() => onMove(step, -1)} aria-label="Move step up">▲</button>
            <button className="bk-link" disabled={index === total - 1} onClick={() => onMove(step, 1)} aria-label="Move step down">▼</button>
            <button className="bk-link bk-link-danger" onClick={() => onDelete(step)} aria-label="Delete step">🗑</button>
          </div>
        )}
      </div>

      {isAdmin ? (
        <div
          className={`bk-step-photo ${dragOver ? "bk-dropzone-active" : ""} ${!step.image_url ? "bk-step-photo-empty" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {step.image_url ? (
            <>
              <img src={step.image_url} alt="" className="bk-step-photo-img" />
              <span className="bk-step-photo-replace">{busy ? "Uploading…" : "Replace photo"}</span>
            </>
          ) : (
            <span className="bk-step-photo-hint">{busy ? "Uploading…" : "Click or drag a photo here"}</span>
          )}
        </div>
      ) : (
        step.image_url && (
          <div className="bk-step-photo">
            <img src={step.image_url} alt="" className="bk-step-photo-img" />
          </div>
        )
      )}

      {isAdmin ? (
        <>
          <input
            className="bk-input"
            style={{ marginTop: 10 }}
            placeholder="Step title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => onBlurField(step, "title", title)}
          />
          <textarea
            className="bk-input"
            style={{ marginTop: 8 }}
            rows={3}
            placeholder="Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onBlur={() => onBlurField(step, "instructions", instructions)}
          />
        </>
      ) : (
        <>
          {step.title && <h4 className="bk-subhead" style={{ marginTop: 10 }}>{step.title}</h4>}
          <p style={{ marginTop: step.title ? 4 : 10 }}>{step.instructions}</p>
        </>
      )}
    </div>
  );
}

export default function PrepMethodTab({ recipeId, steps, isAdmin, onSaved }) {
  const [busyId, setBusyId] = useState(null);

  async function handleAddStep() {
    const maxNum = steps.reduce((m, s) => Math.max(m, s.step_number), 0);
    await insertStep({ recipe_id: recipeId, step_number: maxNum + 1, title: "", instructions: "" });
    await onSaved();
  }

  async function handleBlurField(step, field, value) {
    if (value === (step[field] || "")) return;
    await updateStep(step.id, { [field]: value });
    await onSaved();
  }

  async function handleDelete(step) {
    if (!confirm("Delete this step?")) return;
    await deleteStep(step);
    await onSaved();
  }

  async function handleMove(step, direction) {
    const idx = steps.findIndex((s) => s.id === step.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= steps.length) return;
    const other = steps[swapIdx];
    await updateStep(step.id, { step_number: other.step_number });
    await updateStep(other.id, { step_number: step.step_number });
    await onSaved();
  }

  async function handleUpload(step, file) {
    setBusyId(step.id);
    try {
      const url = await uploadStepImage(recipeId, step.id, file);
      await updateStep(step.id, { image_url: url });
      await onSaved();
    } catch (e) {
      console.error(e);
      alert("Couldn't upload that photo — check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="bk-step-stack">
      {steps.length === 0 && (
        <p className="bk-disclaimer" style={{ marginTop: 0 }}>
          {isAdmin ? "No prep steps yet — add the first one below." : "No prep steps have been added for this recipe yet."}
        </p>
      )}
      {steps.map((step, i) => (
        <StepCard
          key={step.id}
          step={step}
          index={i}
          total={steps.length}
          isAdmin={isAdmin}
          busy={busyId === step.id}
          onBlurField={handleBlurField}
          onDelete={handleDelete}
          onMove={handleMove}
          onUpload={handleUpload}
        />
      ))}
      {isAdmin && (
        <button className="bk-btn-secondary" onClick={handleAddStep}>+ Add Step</button>
      )}
    </div>
  );
}
