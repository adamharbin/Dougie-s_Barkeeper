"use client";

import { Fragment, useState } from "react";
import { updateItem, insertPrice, saveInventoryCount } from "@/lib/db";
import {
  weightedAvgCost,
  costPerRecipeUnit,
  checkedInDate,
  estimatedExpiration,
  daysUntil,
  onHandValue,
  computeInventoryValuation,
  fmtMoney,
  fmtDate,
  todayISO,
} from "@/lib/costing";

export default function InventoryRow({ item, items, prices, isAdmin, onSaved, onOpenPrices, onDelete }) {
  const [draft, setDraft] = useState({
    name: item.name,
    category_tag: item.category_tag,
    unit: item.unit || "",
    par_level: item.par_level ?? "",
    shelf_life_days: item.shelf_life_days ?? "",
    recipe_unit: item.recipe_unit || "",
    units_per_purchase_unit: item.units_per_purchase_unit ?? 1,
  });
  const [onHandDraft, setOnHandDraft] = useState("");
  const [caseQty, setCaseQty] = useState("");
  const [unitsPerCase, setUnitsPerCase] = useState("1");
  const [totalCost, setTotalCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cost = weightedAvgCost(item.id, prices);
  const recipeCost = costPerRecipeUnit(item, prices);
  const checkedIn = checkedInDate(item.id, prices);
  const exp = estimatedExpiration({ ...item, shelf_life_days: draft.shelf_life_days }, prices);
  const dLeft = exp ? daysUntil(exp) : null;
  const flag = dLeft != null && dLeft <= 3;
  const onHandVal = onHandValue(item, prices);

  async function saveField(patch) {
    setSaving(true);
    setError("");
    try {
      await updateItem(item.id, { ...draft, ...patch });
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

  const totalUnits = (Number(caseQty) || 0) * (Number(unitsPerCase) || 0);

  async function logCost() {
    if (!caseQty || !unitsPerCase || !totalCost || !totalUnits) return;
    setSaving(true);
    setError("");
    try {
      await insertPrice({
        item_id: item.id,
        quantity: totalUnits,
        cost: Number(totalCost) / totalUnits,
        case_quantity: caseQty,
        units_per_case: unitsPerCase,
        unit: item.unit || "",
        vendor_id: null,
        purchase_date: todayISO(),
        checked_in_date: todayISO(),
        source: "manual",
      });
      await onSaved();
      setCaseQty("");
      setUnitsPerCase("1");
      setTotalCost("");
    } catch (e) {
      console.error(e);
      setError("Couldn't log that purchase — try again.");
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
        </select>
      </td>
      <td>
        <input
          className="bk-input"
          style={{ width: 90 }}
          value={draft.unit}
          onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
          onBlur={() => saveField({ unit: draft.unit })}
        />
      </td>
      <td style={{ minWidth: 190 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
          <input className="bk-input" type="number" style={{ width: 55 }} placeholder="Cases" value={caseQty} onChange={(e) => setCaseQty(e.target.value)} />
          <input className="bk-input" type="number" style={{ width: 65 }} placeholder="Units/case" value={unitsPerCase} onChange={(e) => setUnitsPerCase(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input className="bk-input" type="number" style={{ width: 75 }} placeholder="Total cost" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} />
          <button className="bk-link" disabled={!totalUnits || !totalCost || saving} onClick={logCost}>Log</button>
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 3 }}>
          {cost == null ? <span className="bk-needs-pricing">needs pricing</span> : `${fmtMoney(cost)} / ${item.unit || "unit"} avg`}
        </div>
      </td>
      <td style={{ minWidth: 130 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
          <input
            className="bk-input"
            style={{ width: 60 }}
            placeholder="e.g. oz"
            value={draft.recipe_unit}
            onChange={(e) => setDraft({ ...draft, recipe_unit: e.target.value })}
            onBlur={() => saveField({ recipe_unit: draft.recipe_unit })}
          />
          <input
            className="bk-input"
            type="number"
            style={{ width: 55 }}
            title={`# recipe units per 1 ${item.unit || "unit"}`}
            value={draft.units_per_purchase_unit}
            onChange={(e) => setDraft({ ...draft, units_per_purchase_unit: e.target.value })}
            onBlur={() => saveField({ units_per_purchase_unit: draft.units_per_purchase_unit })}
          />
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.75 }}>
          {recipeCost == null ? (
            <span className="bk-needs-pricing">needs pricing</span>
          ) : (
            `${fmtMoney(recipeCost)} / ${draft.recipe_unit || item.unit || "unit"}`
          )}
        </div>
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
        <button className="bk-link" onClick={() => onOpenPrices(item)}>Prices</button>
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
