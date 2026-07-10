"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { insertItem, insertRecipe, updateRecipe, replaceRecipeIngredients } from "@/lib/db";
import { weightedAvgCost, recipeLaborCost, fmtMoney } from "@/lib/costing";
import { Modal, Field, EmptyState } from "./ui";

function blankDraft() {
  return { key: crypto.randomUUID(), mode: "existing", item_id: "", newName: "", quantity: "", unit: "" };
}

export default function RecipeModal({ recipe, items, prices, settings, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const isNew = !recipe?.id;
  const [form, setForm] = useState(
    recipe || { name: "", category_tag: "Food", yield: "", menu_price: "", labor_minutes: "", prep_notes: "", ingredients: [] }
  );
  const [ingDraft, setIngDraft] = useState(blankDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function addIngredient() {
    if (ingDraft.mode === "existing") {
      if (!ingDraft.item_id || !ingDraft.quantity) return;
      const item = items.find((i) => i.id === ingDraft.item_id);
      setForm((f) => ({
        ...f,
        ingredients: [...f.ingredients, { key: crypto.randomUUID(), item_id: ingDraft.item_id, quantity: ingDraft.quantity, unit: ingDraft.unit || item?.unit || "" }],
      }));
    } else {
      if (!ingDraft.newName.trim() || !ingDraft.quantity) return;
      setForm((f) => ({
        ...f,
        ingredients: [
          ...f.ingredients,
          { key: crypto.randomUUID(), item_id: null, newName: ingDraft.newName.trim(), quantity: ingDraft.quantity, unit: ingDraft.unit || "" },
        ],
      }));
    }
    setIngDraft(blankDraft());
  }

  function removeIngredient(key) {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((ing) => ing.key !== key) }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const resolvedIngredients = [];
      for (const ing of form.ingredients) {
        let itemId = ing.item_id;
        if (!itemId) {
          const created = await insertItem({ name: ing.newName, category_tag: form.category_tag, unit: ing.unit, par_level: "", shelf_life_days: "" });
          itemId = created.id;
        }
        resolvedIngredients.push({ item_id: itemId, quantity: ing.quantity, unit: ing.unit });
      }

      const recipeId = isNew ? (await insertRecipe(form)).id : recipe.id;
      if (!isNew) await updateRecipe(recipeId, form);
      await replaceRecipeIngredients(recipeId, resolvedIngredients);

      await onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Couldn't save that recipe — check your connection and try again.");
      setSaving(false);
    }
  }

  const laborRate = form.category_tag === "Food" ? settings.labor_rates?.food_hourly_rate : settings.labor_rates?.bar_hourly_rate;

  return (
    <Modal title={isAdmin ? (isNew ? "Add recipe" : `Edit ${recipe.name}`) : recipe.name} onClose={onClose} wide>
      <Field label="Name">
        <input className="bk-input" disabled={!isAdmin} value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <div className="bk-form-row">
        <Field label="Category tag">
          <select className="bk-input" disabled={!isAdmin} value={form.category_tag} onChange={(e) => set("category_tag", e.target.value)}>
            <option>Food</option>
            <option>Bar</option>
          </select>
        </Field>
        <Field label="Yield"><input className="bk-input" disabled={!isAdmin} value={form.yield} onChange={(e) => set("yield", e.target.value)} placeholder="e.g. 24 wings" /></Field>
        <Field label="Menu price"><input className="bk-input" type="number" disabled={!isAdmin} value={form.menu_price} onChange={(e) => set("menu_price", e.target.value)} /></Field>
      </div>
      <div className="bk-form-row">
        <Field label="Labor time (minutes to make/prep one yield)">
          <input className="bk-input" type="number" disabled={!isAdmin} value={form.labor_minutes} onChange={(e) => set("labor_minutes", e.target.value)} />
        </Field>
        <div className="bk-field">
          <span>Labor cost (calculated)</span>
          <div className="bk-computed-value">
            {fmtMoney(recipeLaborCost(form, settings))} <span className="bk-computed-hint">at {fmtMoney(laborRate || 0)}/hr</span>
          </div>
        </div>
      </div>
      <Field label="Prep notes">
        <textarea className="bk-input" rows={2} disabled={!isAdmin} value={form.prep_notes} onChange={(e) => set("prep_notes", e.target.value)} />
      </Field>

      <h4 className="bk-subhead">Ingredients</h4>
      <table className="bk-table bk-table-compact">
        <thead><tr><th>Ingredient</th><th>Qty</th><th>Unit</th><th>Cost</th>{isAdmin && <th></th>}</tr></thead>
        <tbody>
          {form.ingredients.length === 0 && (
            <tr><td colSpan={5}><EmptyState text="No ingredients yet." /></td></tr>
          )}
          {form.ingredients.map((ing) => {
            const item = ing.item_id ? items.find((i) => i.id === ing.item_id) : null;
            const name = item?.name || ing.newName || "New item";
            const cost = item ? weightedAvgCost(item.id, prices) : null;
            return (
              <tr key={ing.key}>
                <td>{name} {!item && <span className="bk-flag-tiny" title="Will be created as a new inventory item"> new</span>} {item && cost == null && <span className="bk-needs-pricing">needs pricing</span>}</td>
                <td>{ing.quantity}</td>
                <td>{ing.unit}</td>
                <td>{cost == null ? "—" : fmtMoney(cost * Number(ing.quantity || 0))}</td>
                {isAdmin && <td><button className="bk-link bk-link-danger" onClick={() => removeIngredient(ing.key)}>Remove</button></td>}
              </tr>
            );
          })}
        </tbody>
      </table>

      {isAdmin && (
        <div className="bk-inline-form">
          <select className="bk-input" value={ingDraft.mode} onChange={(e) => setIngDraft({ ...ingDraft, mode: e.target.value })}>
            <option value="existing">Existing item</option>
            <option value="new">New item</option>
          </select>
          {ingDraft.mode === "existing" ? (
            <select className="bk-input" value={ingDraft.item_id} onChange={(e) => setIngDraft({ ...ingDraft, item_id: e.target.value })}>
              <option value="">Choose item…</option>
              {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          ) : (
            <input className="bk-input" placeholder="New ingredient name" value={ingDraft.newName} onChange={(e) => setIngDraft({ ...ingDraft, newName: e.target.value })} />
          )}
          <input className="bk-input" type="number" placeholder="Qty" value={ingDraft.quantity} onChange={(e) => setIngDraft({ ...ingDraft, quantity: e.target.value })} />
          <input className="bk-input" placeholder="Unit" value={ingDraft.unit} onChange={(e) => setIngDraft({ ...ingDraft, unit: e.target.value })} />
          <button className="bk-btn-secondary" onClick={addIngredient}>+ Add ingredient</button>
        </div>
      )}

      {error && <p className="bk-error-text">{error}</p>}
      {isAdmin && (
        <div className="bk-modal-actions">
          <button className="bk-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="bk-btn-primary" disabled={!form.name.trim() || saving} onClick={save}>
            {saving ? "Saving…" : "Save recipe"}
          </button>
        </div>
      )}
    </Modal>
  );
}
