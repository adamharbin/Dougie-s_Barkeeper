"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { updateGoalSettings } from "@/lib/db";
import { SectionHead, Field } from "./ui";

export default function SettingsTab({ settings, onSaved }) {
  const { isAdmin } = useAuth();
  const [rates, setRates] = useState(settings.labor_rates);
  const [goals, setGoals] = useState(settings.goals);
  const [savingRates, setSavingRates] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [error, setError] = useState("");

  async function saveRates() {
    if (!isAdmin) return;
    setSavingRates(true);
    setError("");
    try {
      await updateGoalSettings(rates);
      await onSaved();
    } catch (e) {
      console.error(e);
      setError("Couldn't save labor rates — check your connection and try again.");
    } finally {
      setSavingRates(false);
    }
  }

  async function saveGoals() {
    if (!isAdmin) return;
    setSavingGoals(true);
    setError("");
    try {
      await updateGoalSettings(goals);
      await onSaved();
    } catch (e) {
      console.error(e);
      setError("Couldn't save goal margins — check your connection and try again.");
    } finally {
      setSavingGoals(false);
    }
  }

  return (
    <div>
      <SectionHead
        title="Settings"
        desc={isAdmin ? "Labor rates and goal margins — these drive the color-coding everywhere else." : "View-only — ask an admin to make changes here."}
      />

      <div className="bk-card">
        <h4>Labor rates</h4>
        <p className="bk-disclaimer" style={{ marginTop: 0 }}>
          Used with each recipe&apos;s labor time (set on the Recipes tab) to calculate labor cost: minutes ÷ 60 × hourly rate.
        </p>
        <div className="bk-form-row">
          <Field label="Food hourly rate">
            <input
              className="bk-input"
              type="number"
              disabled={!isAdmin}
              value={rates.food_hourly_rate}
              onChange={(e) => setRates({ ...rates, food_hourly_rate: e.target.value })}
            />
          </Field>
          <Field label="Bar hourly rate">
            <input
              className="bk-input"
              type="number"
              disabled={!isAdmin}
              value={rates.bar_hourly_rate}
              onChange={(e) => setRates({ ...rates, bar_hourly_rate: e.target.value })}
            />
          </Field>
        </div>
        {isAdmin && (
          <div className="bk-modal-actions">
            <button className="bk-btn-primary" disabled={savingRates} onClick={saveRates}>
              {savingRates ? "Saving…" : "Save rates"}
            </button>
          </div>
        )}
      </div>

      <div className="bk-card">
        <h4>Goal margins</h4>
        <div className="bk-form-row">
          <Field label="Target food cost %">
            <input
              className="bk-input"
              type="number"
              disabled={!isAdmin}
              value={goals.target_food_cost_pct}
              onChange={(e) => setGoals({ ...goals, target_food_cost_pct: e.target.value })}
            />
          </Field>
          <Field label="Target bar cost %">
            <input
              className="bk-input"
              type="number"
              disabled={!isAdmin}
              value={goals.target_bar_cost_pct}
              onChange={(e) => setGoals({ ...goals, target_bar_cost_pct: e.target.value })}
            />
          </Field>
          <Field label="Target prime cost %">
            <input
              className="bk-input"
              type="number"
              disabled={!isAdmin}
              value={goals.target_prime_cost_pct}
              onChange={(e) => setGoals({ ...goals, target_prime_cost_pct: e.target.value })}
            />
          </Field>
        </div>
        {isAdmin && (
          <div className="bk-modal-actions">
            <button className="bk-btn-primary" disabled={savingGoals} onClick={saveGoals}>
              {savingGoals ? "Saving…" : "Save goals"}
            </button>
          </div>
        )}
      </div>
      {error && <p className="bk-error-text">{error}</p>}
    </div>
  );
}
