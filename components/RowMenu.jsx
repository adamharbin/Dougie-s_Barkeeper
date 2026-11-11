"use client";

import { useEffect, useRef, useState } from "react";

// "⋯" row-actions menu: opens on hover (and on tap/click for touch devices).
// `items` is [{ label, onClick, danger?, hidden? }]. The list is position:fixed
// so it isn't clipped by a table's scroll box.
export default function RowMenu({ items }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({});
  const wrapRef = useRef(null);
  const closeTimer = useRef(null);

  const visible = items.filter((i) => !i.hidden);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function openMenu() {
    clearTimeout(closeTimer.current);
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) {
      const menuHeight = visible.length * 34 + 10;
      const flipUp = rect.bottom + menuHeight > window.innerHeight;
      setPos({
        right: window.innerWidth - rect.right,
        ...(flipUp ? { bottom: window.innerHeight - rect.top } : { top: rect.bottom }),
      });
    }
    setOpen(true);
  }

  function scheduleClose() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  if (visible.length === 0) return null;

  return (
    <div className="bk-row-menu" ref={wrapRef} onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        type="button"
        className={`bk-row-menu-btn ${open ? "open" : ""}`}
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={openMenu}
      >
        ⋯
      </button>
      {open && (
        <div className="bk-row-menu-list" role="menu" style={pos}>
          {visible.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`bk-row-menu-item ${item.danger ? "danger" : ""}`}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
