"use client";

import { Fragment, useState } from "react";
import { updateItem, insertPrice, saveInventoryCount } from "@/lib/db";
import {
  weightedAvgCost,
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
  });
  const [onHandDraft, setOnHandDraft] = useState("");
  const [costQty, setCostQty] = useState("");
  const [costTotal, setCostTotal] = useState("");
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

  async function logCost() {
    const qty = Number(costQty);
    const total = Number(costTotal);
    if (!qty || !total) return;
    setSaving(true);
    setError("");
    try {
      await insertPrice({
        item_id: item.id,
        quantity: qty,
        cost: total / qty,
        case_quantity: qty,
        units_per_case: 1,
        unit: item.unit || "",
        vendor_id: null,
        purchase_date: todayISO(),
        checked_in_date: todayISO(),
        source: "manual",
      });
      await onSaved();
      setCostQty("");
      setCostTotal("");
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
      <td>
        <div className="bk-inline-form" style={{ flexWrap: "nowrap", marginTop: 0, gap: 4 }}>
          <input className="bk-input" type="number" style={{ width: 50 }} placeholder="Qty" value={costQty} onChange={(e) => setCostQty(e.target.value)} />
          <input className="bk-input" type="number" style={{ width: 65 }} placeholder="Total $" value={costTotal} onChange={(e) => setCostTotal(e.target.value)} />
          <button className="bk-link" disabled={!costQty || !costTotal || saving} onClick={logCost}>Log</button>
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 3 }}>
          {cost == null ? <span className="bk-needs-pricing">needs pricing</span> : `${fmtMoney(cost)} avg`}
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
        <td colSpan={11} className="bk-error-text">{error}</td>
      </tr>
    )}
    </Fragment>
  );
}
