"use client";

import { useState } from "react";

export function Pill({ tag }) {
  const cls = tag === "Food" ? "pill-food" : tag === "Bar" ? "pill-bar" : "pill-shared";
  return <span className={`bk-pill ${cls}`}>{tag}</span>;
}

export function StatCard({ label, value, sub, tone }) {
  return (
    <div className={`bk-stat ${tone}`}>
      <div className="bk-stat-label">{label}</div>
      <div className="bk-stat-value">{value}</div>
      {sub && <div className="bk-stat-sub">{sub}</div>}
    </div>
  );
}

export function SectionHead({ title, desc, action }) {
  return (
    <div className="bk-section-head">
      <div>
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ text, sub }) {
  return (
    <div className="bk-empty">
      <div className="bk-empty-text">{text}</div>
      {sub && <div className="bk-empty-sub">{sub}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="bk-modal-overlay" onClick={onClose}>
      <div className={`bk-modal ${wide ? "bk-modal-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="bk-modal-head">
          <h3>{title}</h3>
          <button className="bk-x" onClick={onClose}>✕</button>
        </div>
        <div className="bk-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="bk-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

// Type-to-search dropdown. `options` is [{ value, label }]; pass them
// pre-sorted (callers control ordering, e.g. alphabetical).
export function SearchableSelect({ options, value, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <div className="bk-searchable-select">
      <input
        className="bk-input"
        placeholder={placeholder || "Search…"}
        value={open ? query : selected?.label || ""}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="bk-searchable-select-menu">
          {filtered.length === 0 ? (
            <div className="bk-searchable-select-empty">No matches</div>
          ) : (
            filtered.map((o) => (
              <div
                key={o.value}
                className="bk-searchable-select-option"
                onMouseDown={() => {
                  onChange(o.value);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {o.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
