"use client";

import { Fragment, useState } from "react";
import { updateItem, saveInventoryCount } from "@/lib/db";
import {
  weightedAvgCost,
  formatPurchaseUnitLabel,
  checkedInDate,
  estimatedExpiration,
  daysUntil,
  onHandValue,
  computeInventoryValuation,
  fmtMoney,
  fmtDate,
  todayISO,
} from "@/lib/costing";

export default function InventoryRow({ item, items, prices, isAdmin, onSaved, onOpenEdit, onDelete }) {
  const [draft, setDraft] = useState({
    name: item.name,
    category_tag: item.category_tag,
    recipe_unit: item.recipe_unit || "",
    par_level: item.par_level ?? "",
    shelf_life_days: item.shelf_life_days ?? "",
  });
  const [onHandDraft, setOnHandDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cost = weightedAvgCost(item.id, prices);
  const checkedIn = checkedInDate(item.id, prices);
  const exp = estimatedExpiration({ ...item, shelf_life_days: draft.shelf_life_days }, prices);
  const dLeft = exp ? daysUntil(exp) : null;
  const flag = dLeft != null && dLeft <= 3;
  const onHandVal = onHandValue(item, prices);

  async function saveField(patch) {
    setSaving(true);
    setError("");
    try {
      await updateItem(item.id, { ...item, ...draft, ...patch });
      await onSaved();
    } catch (e) {
      console.error(e);
      setError("Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function saveOnHand() {
    if (onHandDraft === "") return;
    const qty = Number(onHandDraft);
    setSaving(true);
    setError("");
    try {
      const { rows, totalValue } = computeInventoryValuation(items, prices, { [item.id]: qty });
      const row = rows.find((r) => r.item.id === item.id);
      await saveInventoryCount({
        countDate: todayISO(),
        totalValue,
        lines: [{ item_id: item.id, quantity: qty, unit_cost: row.cost, line_value: row.value }],
      });
      await onSaved();
      setOnHandDraft("");
    } catch (e) {
      console.error(e);
      setError("Couldn't save that count — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Fragment>
    <tr className={flag ? "bk-row-flag" : ""}>
      <td>
        <input
          className="bk-input"
          style={{ minWidth: 130 }}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          onBlur={() => saveField({ name: draft.name })}
        />
      </td>
      <td>
        <select
          className="bk-input"
          value={draft.category_tag}
          onChange={(e) => {
            setDraft({ ...draft, category_tag: e.target.value });
            saveField({ category_tag: e.target.value });
          }}
        >
          <option>Food</option>
          <option>Bar</option>
          <option>Shared</option>
          <option>Supplies</option>
          <option>Packaging</option>
        </select>
      </td>
      <td style={{ fontSize: 12.5 }}>{formatPurchaseUnitLabel(item)}</td>
      <td>
        <input
          className="bk-input"
          style={{ width: 80 }}
          placeholder="e.g. oz"
          value={draft.recipe_unit}
          onChange={(e) => setDraft({ ...draft, recipe_unit: e.target.value })}
          onBlur={() => saveField({ recipe_unit: draft.recipe_unit })}
        />
      </td>
      <td>
        {cost == null ? <span className="bk-needs-pricing">needs pricing</span> : `${fmtMoney(cost)} / ${item.recipe_unit || "unit"}`}
      </td>
      <td>
        <input
          className="bk-input"
          type="number"
          style={{ width: 60 }}
          value={draft.par_level}
          onChange={(e) => setDraft({ ...draft, par_level: e.target.value })}
          onBlur={() => saveField({ par_level: draft.par_level })}
        />
      </td>
      <td>
        <input
          className="bk-input"
          type="number"
          style={{ width: 60 }}
          value={draft.shelf_life_days}
          onChange={(e) => setDraft({ ...draft, shelf_life_days: e.target.value })}
          onBlur={() => saveField({ shelf_life_days: draft.shelf_life_days })}
        />
      </td>
      <td>
        <input
          className="bk-input"
          type="number"
          style={{ width: 70 }}
          placeholder={item.on_hand_qty != null ? String(item.on_hand_qty) : "not counted"}
          value={onHandDraft}
          onChange={(e) => setOnHandDraft(e.target.value)}
          onBlur={saveOnHand}
        />
      </td>
      <td>{onHandVal == null ? "—" : fmtMoney(onHandVal)}</td>
      <td>{fmtDate(checkedIn)}</td>
      <td className={flag ? "bk-expiring" : ""}>{exp ? `${fmtDate(exp)}${flag ? ` (${dLeft}d)` : ""}` : "—"}</td>
      <td className="bk-row-actions">
        <button className="bk-link" onClick={() => onOpenEdit(item)}>Edit</button>
        {isAdmin && <button className="bk-link bk-link-danger" onClick={() => onDelete(item.id)}>Delete</button>}
      </td>
    </tr>
    {error && (
      <tr>
        <td colSpan={12} className="bk-error-text">{error}</td>
      </tr>
    )}
    </Fragment>
  );
}
