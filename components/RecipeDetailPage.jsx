"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { updateRecipe, deleteRecipe, replaceRecipeIngredients, insertItem } from "@/lib/db";
import { recipeMetrics, healthClass, fmtMoney, fmtPct, costPerRecipeUnit, DEFAULT_GOALS, MENU_CATEGORIES } from "@/lib/costing";
import { Pill, EmptyState } from "./ui";
import PrepMethodTab from "./PrepMethodTab";
import PrepSlideshow from "./PrepSlideshow";

function blankIngDraft() {
  return { key: crypto.randomUUID(), mode: "existing", item_id: "", newName: "", quantity: "", unit: "" };
}

function CostBreakdown({ recipe, m, target, goals }) {
  return (
    <div className="bk-recipe-stats">
      <div className="bk-field"><span>Menu price</span><div className="bk-computed-value">{fmtMoney(recipe.menu_price)}</div></div>
      <div className="bk-field"><span>Labor cost</span><div className="bk-computed-value">{recipe.labor_minutes ? fmtMoney(m.labor) : <span className="bk-needs-pricing">no time set</span>}</div></div>
      <div className="bk-field"><span>Food cost $</span><div className="bk-computed-value">{fmtMoney(m.ingCost)}</div></div>
      <div className="bk-field"><span>Food cost %</span><div className={`bk-computed-value ${healthClass(m.foodCostPct, target)}`}>{fmtPct(m.foodCostPct)}</div></div>
      <div className="bk-field"><span>Prime cost $</span><div className="bk-computed-value">{fmtMoney(m.prime)}</div></div>
      <div className="bk-field"><span>Prime cost %</span><div className={`bk-computed-value ${healthClass(m.primeCostPct, goals.target_prime_cost_pct)}`}>{fmtPct(m.primeCostPct)}</div></div>
    </div>
  );
}

export default function RecipeDetailPage({ recipeId, recipes, items, prices, settings, onSaved }) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const recipe = recipes.find((r) => r.id === recipeId);
  const [rightTab, setRightTab] = useState("prep"); // prep | cost | uom
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [ingDraft, setIngDraft] = useState(blankIngDraft());
  const [draft, setDraft] = useState(
    recipe
      ? {
          name: recipe.name,
          category_tag: recipe.category_tag,
          menu_category: recipe.menu_category || "",
          yield: recipe.yield || "",
          menu_price: recipe.menu_price ?? "",
          labor_minutes: recipe.labor_minutes ?? "",
          prep_notes: recipe.prep_notes || "",
        }
      : null
  );
  const [error, setError] = useState("");

  if (!recipe) {
    return (
      <div className="bk-card">
        <p>This recipe couldn&apos;t be found — it may have been deleted.</p>
        <Link href="/?tab=recipes" className="bk-link">← Back to Recipes</Link>
      </div>
    );
  }

  const goals = settings.goals || DEFAULT_GOALS;
  const target = recipe.category_tag === "Food" ? goals.target_food_cost_pct : goals.target_bar_cost_pct;
  const m = recipeMetrics(recipe, items, prices, recipes, settings);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  async function saveField(field, value) {
    if (value === draft[field]) return;
    setError("");
    try {
      await updateRecipe(recipe.id, { ...draft, [field]: value });
      await onSaved();
    } catch (e) {
      console.error(e);
      setError("Couldn't save — check your connection and try again.");
    }
  }

  async function saveIngredients(nextIngredients) {
    setError("");
    try {
      await replaceRecipeIngredients(
        recipe.id,
        nextIngredients.map((ing) => ({ item_id: ing.item_id, quantity: ing.quantity, unit: ing.unit }))
      );
      await onSaved();
    } catch (e) {
      console.error(e);
      setError("Couldn't save ingredients — check your connection and try again.");
    }
  }

  async function addIngredient() {
    let itemId = ingDraft.item_id;
    let unit = ingDraft.unit;
    try {
      if (ingDraft.mode === "existing") {
        if (!itemId || !ingDraft.quantity) return;
        const item = items.find((i) => i.id === itemId);
        unit = unit || item?.recipe_unit || "";
      } else {
        if (!ingDraft.newName.trim() || !ingDraft.quantity) return;
        const created = await insertItem({
          name: ingDraft.newName.trim(),
          category_tag: recipe.category_tag,
          recipe_unit: unit,
          purchase_unit: unit,
          pack_qty: 1,
          size_per_inner: 1,
          size_uom: unit,
          par_level: "",
          shelf_life_days: "",
        });
        itemId = created.id;
      }
      const next = [...recipe.ingredients, { item_id: itemId, quantity: ingDraft.quantity, unit }];
      await saveIngredients(next);
      setIngDraft(blankIngDraft());
    } catch (e) {
      console.error(e);
      setError("Couldn't add that ingredient — check your connection and try again.");
    }
  }

  async function removeIngredient(ingId) {
    const next = recipe.ingredients.filter((ing) => ing.id !== ingId);
    await saveIngredients(next);
  }

  async function handleDelete() {
    if (!isAdmin) return;
    if (!confirm("Delete this recipe? Purchase history and prep steps go with it.")) return;
    await deleteRecipe(recipe.id);
    router.push("/?tab=recipes");
  }

  return (
    <div>
      <Link href="/?tab=recipes" className="bk-link">← Back to Recipes</Link>

      <div className="bk-recipe-detail-header" style={{ marginTop: 10 }}>
        <h2>{recipe.name} {m.hasUnpriced && <span className="bk-flag-tiny" title="Contains ingredients that need pricing">⚠</span>}</h2>
        <Pill tag={recipe.category_tag} />
        <span style={{ fontSize: 13, color: "#8a8072" }}>{recipe.menu_category || "Uncategorized"}</span>
      </div>

      {error && <p className="bk-error-text">{error}</p>}

      <div className="bk-recipe-detail-grid">
        {/* Left column: recipe fields, costing, ingredients */}
        <div>
          <div className="bk-card">
            <h4>Recipe details</h4>
            <div className="bk-form-row">
              <div className="bk-field">
                <span>Name</span>
                <input className="bk-input" disabled={!isAdmin} value={draft.name} onChange={(e) => set("name", e.target.value)} onBlur={(e) => saveField("name", e.target.value)} />
              </div>
              <div className="bk-field">
                <span>Category tag</span>
                <select className="bk-input" disabled={!isAdmin} value={draft.category_tag} onChange={(e) => { set("category_tag", e.target.value); saveField("category_tag", e.target.value); }}>
                  <option>Food</option>
                  <option>Bar</option>
                </select>
              </div>
            </div>
            <div className="bk-form-row">
              <div className="bk-field">
                <span>Menu category</span>
                <select className="bk-input" disabled={!isAdmin} value={draft.menu_category} onChange={(e) => { set("menu_category", e.target.value); saveField("menu_category", e.target.value); }}>
                  <option value="">— Uncategorized —</option>
                  {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="bk-field">
                <span>Yield</span>
                <input className="bk-input" disabled={!isAdmin} value={draft.yield} onChange={(e) => set("yield", e.target.value)} onBlur={(e) => saveField("yield", e.target.value)} placeholder="e.g. 24 wings" />
              </div>
            </div>
            <div className="bk-form-row">
              <div className="bk-field">
                <span>Menu price</span>
                <input className="bk-input" type="number" disabled={!isAdmin} value={draft.menu_price} onChange={(e) => set("menu_price", e.target.value)} onBlur={(e) => saveField("menu_price", e.target.value)} />
              </div>
              <div className="bk-field">
                <span>Labor time (minutes)</span>
                <input className="bk-input" type="number" disabled={!isAdmin} value={draft.labor_minutes} onChange={(e) => set("labor_minutes", e.target.value)} onBlur={(e) => saveField("labor_minutes", e.target.value)} />
              </div>
            </div>
            <div className="bk-field">
              <span>Prep notes</span>
              <textarea className="bk-input" rows={2} disabled={!isAdmin} value={draft.prep_notes} onChange={(e) => set("prep_notes", e.target.value)} onBlur={(e) => saveField("prep_notes", e.target.value)} />
            </div>
          </div>

          <div className="bk-card">
            <h4>Costing</h4>
            <CostBreakdown recipe={recipe} m={m} target={target} goals={goals} />
            <p className="bk-disclaimer">
              Labor cost is labor time × the hourly rate for this recipe&apos;s category, set in Settings.
            </p>
          </div>

          <div className="bk-card">
            <h4>Ingredients</h4>
            <table className="bk-table bk-table-compact">
              <thead><tr><th>Ingredient</th><th>Qty</th><th>Unit</th><th>Cost</th>{isAdmin && <th></th>}</tr></thead>
              <tbody>
                {recipe.ingredients.length === 0 && (
                  <tr><td colSpan={5}><EmptyState text="No ingredients yet." /></td></tr>
                )}
                {recipe.ingredients.map((ing) => {
                  const item = items.find((i) => i.id === ing.item_id);
                  const cost = item ? costPerRecipeUnit(item, prices) : null;
                  return (
                    <tr key={ing.id}>
                      <td>{item?.name || "Unknown item"} {item && cost == null && <span className="bk-needs-pricing">needs pricing</span>}</td>
                      <td>{ing.quantity}</td>
                      <td>{ing.unit}</td>
                      <td>{cost == null ? "—" : fmtMoney(cost * Number(ing.quantity || 0))}</td>
                      {isAdmin && <td><button className="bk-link bk-link-danger" onClick={() => removeIngredient(ing.id)}>Remove</button></td>}
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
                <input
                  className="bk-input"
                  placeholder={items.find((i) => i.id === ingDraft.item_id)?.recipe_unit || "Unit"}
                  value={ingDraft.unit}
                  onChange={(e) => setIngDraft({ ...ingDraft, unit: e.target.value })}
                />
                <button className="bk-btn-secondary" onClick={addIngredient}>+ Add ingredient</button>
              </div>
            )}
          </div>

          {isAdmin && (
            <button className="bk-link bk-link-danger" onClick={handleDelete}>Delete recipe</button>
          )}
        </div>

        {/* Right column: Build Guide */}
        <div>
          <div className="bk-toolbar">
            <button className={`bk-subtab ${rightTab === "prep" ? "active" : ""}`} onClick={() => setRightTab("prep")}>Prep Method</button>
            <button className={`bk-subtab ${rightTab === "cost" ? "active" : ""}`} onClick={() => setRightTab("cost")}>Cost</button>
            <button className={`bk-subtab ${rightTab === "uom" ? "active" : ""}`} onClick={() => setRightTab("uom")}>UoM Equivalency</button>
          </div>

          {rightTab === "prep" && (
            <div className="bk-card">
              {recipe.steps.length > 0 && (
                <button className="bk-btn-primary" style={{ marginBottom: 16 }} onClick={() => setSlideshowOpen(true)}>
                  ▶ Prep Step Slideshow
                </button>
              )}
              <PrepMethodTab recipeId={recipe.id} steps={recipe.steps} isAdmin={isAdmin} onSaved={onSaved} />
            </div>
          )}

          {rightTab === "cost" && (
            <div className="bk-card">
              <CostBreakdown recipe={recipe} m={m} target={target} goals={goals} />
            </div>
          )}

          {rightTab === "uom" && (
            <div className="bk-card">
              <EmptyState text="UoM Equivalency" sub="Coming soon." />
            </div>
          )}
        </div>
      </div>

      {slideshowOpen && <PrepSlideshow steps={recipe.steps} onClose={() => setSlideshowOpen(false)} />}
    </div>
  );
}
