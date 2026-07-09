"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

export const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "inventory", label: "Inventory" },
  { id: "recipes", label: "Recipes" },
  { id: "vendors", label: "Vendors" },
  { id: "settings", label: "Settings" },
];

export default function Nav({ tab, onTabChange }) {
  const { role, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bk-nav">
      <div className="bk-nav-inner">
        <div className="bk-brand">
          <img src="/logo.png" alt="Dougie's Barkeeper" className="bk-brand-logo" />
        </div>
        <div className="bk-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`bk-tab ${tab === t.id ? "active" : ""}`} onClick={() => onTabChange(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="bk-user">
          <span className="bk-user-role">{role || "…"}</span>
          <button className="bk-user-signout" onClick={signOut}>Sign out</button>
        </div>
        <button
          className="bk-hamburger"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          <span className={`bk-hamburger-icon ${mobileMenuOpen ? "open" : ""}`}>
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="bk-mobile-menu">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`bk-mobile-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => { onTabChange(t.id); setMobileMenuOpen(false); }}
            >
              {t.label}
            </button>
          ))}
          <div className="bk-mobile-user">
            <span className="bk-user-role">{role || "…"}</span>
            <button className="bk-user-signout" onClick={signOut}>Sign out</button>
          </div>
        </div>
      )}
    </nav>
  );
}
