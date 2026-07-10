"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { deleteRecipe } from "@/lib/db";
import { recipeMetrics, healthClass, fmtMoney, fmtPct, DEFAULT_GOALS, MENU_CATEGORIES } from "@/lib/costing";
import { SectionHead, EmptyState, Pill } from "./ui";
import RecipeModal from "./RecipeModal";
import UploadRecipeModal from "./UploadRecipeModal";

export default function RecipesTab({ recipes, items, prices, settings, onSaved }) {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const goals = settings.goals || DEFAULT_GOALS;

  const filtered = useMemo(() => {
    let list = recipes.filter((r) => (tagFilter === "All" ? true : r.category_tag === tagFilter));
    if (menuCategoryFilter !== "All") {
      list = list.filter((r) => (menuCategoryFilter === "Uncategorized" ? !r.menu_category : r.menu_category === menuCategoryFilter));
    }
    if (search.trim()) list = list.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [recipes, search, tagFilter, menuCategoryFilter]);

  async function handleDelete(id) {
    if (!isAdmin) return;
    if (!confirm("Delete this recipe?")) return;
    await deleteRecipe(id);
    await onSaved();
  }

  return (
    <div>
      <SectionHead
        title="Recipes"
        desc="Costed off live inventory prices — food and bar, same math."
        action={isAdmin && (
          <div className="bk-action-group">
            <button className="bk-btn-secondary" onClick={() => setUploadOpen(true)}>Upload recipe</button>
            <button className="bk-btn-primary" onClick={() => setAddingNew(true)}>+ Add recipe</button>
          </div>
        )}
      />
      <div className="bk-toolbar">
        <input className="bk-input" placeholder="Search recipes…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="bk-input" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option>All</option><option>Food</option><option>Bar</option>
        </select>
        <select className="bk-input" value={menuCategoryFilter} onChange={(e) => setMenuCategoryFilter(e.target.value)}>
          <option value="All">All menu categories</option>
          {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          <option value="Uncategorized">— Uncategorized —</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="No recipes yet — let's dig one up." sub={isAdmin ? "Add one, or upload a recipe to get started." : "Ask an admin to add one."} />
      ) : (
        <table className="bk-table">
          <thead>
            <tr><th>Recipe</th><th>Tag</th><th>Menu category</th><th>Menu price</th><th>Labor cost</th><th>Food cost $</th><th>Food cost %</th><th>Prime cost $</th><th>Prime cost %</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const m = recipeMetrics(r, items, prices, recipes, settings);
              const target = r.category_tag === "Food" ? goals.target_food_cost_pct : goals.target_bar_cost_pct;
              return (
                <tr key={r.id}>
                  <td>{r.name} {m.hasUnpriced && <span className="bk-flag-tiny" title="Contains ingredients that need pricing">⚠</span>}</td>
                  <td><Pill tag={r.category_tag} /></td>
                  <td style={{ fontSize: 12.5 }}>{r.menu_category || "—"}</td>
                  <td>{fmtMoney(r.menu_price)}</td>
                  <td>{r.labor_minutes ? fmtMoney(m.labor) : <span className="bk-needs-pricing">no time set</span>}</td>
                  <td>{fmtMoney(m.ingCost)}</td>
                  <td className={healthClass(m.foodCostPct, target)}>{fmtPct(m.foodCostPct)}</td>
                  <td>{fmtMoney(m.prime)}</td>
                  <td className={healthClass(m.primeCostPct, goals.target_prime_cost_pct)}>{fmtPct(m.primeCostPct)}</td>
                  <td className="bk-row-actions">
                    <button className="bk-link" onClick={() => setEditing(r)}>{isAdmin ? "Edit" : "View"}</button>
                    {isAdmin && <button className="bk-link bk-link-danger" onClick={() => handleDelete(r.id)}>Delete</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="bk-disclaimer">
        Labor cost per recipe is labor time (minutes) × the hourly rate for its category (Food or Bar), set in Settings. Recipes with no labor time set are treated as $0 labor until it&apos;s added.
      </p>
      {(editing || addingNew) && (
        <RecipeModal
          recipe={editing}
          items={items}
          prices={prices}
          settings={settings}
          onClose={() => { setEditing(null); setAddingNew(false); }}
          onSaved={onSaved}
        />
      )}
      {uploadOpen && isAdmin && (
        <UploadRecipeModal
          items={items}
          prices={prices}
          settings={settings}
          onClose={() => setUploadOpen(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
