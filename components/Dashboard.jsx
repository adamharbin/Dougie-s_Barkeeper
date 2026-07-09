import {
  DEFAULT_GOALS,
  fmtMoney,
  fmtPct,
  fmtDate,
  daysUntil,
  recipeIngredientCost,
  recipeLaborCost,
  recipeMetrics,
  healthClass,
} from "@/lib/costing";
import { Pill, StatCard, SectionHead, EmptyState } from "./ui";

export default function Dashboard({ items, prices, recipes, settings, attention, onGo }) {
  const foodRecipes = recipes.filter((r) => r.category_tag === "Food");
  const barRecipes = recipes.filter((r) => r.category_tag === "Bar");

  const avgPct = (list, key) => {
    const vals = list.map((r) => recipeMetrics(r, items, prices, recipes, settings)[key]).filter((v) => v != null);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const foodCostPct = avgPct(foodRecipes, "foodCostPct");
  const barCostPct = avgPct(barRecipes, "foodCostPct");

  const ingredientTotal = recipes.reduce((s, r) => s + recipeIngredientCost(r, items, prices).total, 0);
  const laborTotal = recipes.reduce((s, r) => s + recipeLaborCost(r, settings), 0);
  const primeCostTotal = laborTotal + ingredientTotal;
  const menuValueTotal = recipes.reduce((s, r) => s + Number(r.menu_price || 0), 0);
  const primeCostPctOfSales = menuValueTotal ? (primeCostTotal / menuValueTotal) * 100 : null;
  const recipesMissingTime = recipes.filter((r) => !r.labor_minutes).length;

  const goals = settings.goals || DEFAULT_GOALS;

  const topCost = [...recipes]
    .map((r) => ({ r, m: recipeMetrics(r, items, prices, recipes, settings) }))
    .filter((x) => x.m.ingCost > 0)
    .sort((a, b) => b.m.ingCost - a.m.ingCost)
    .slice(0, 5);

  const withMargin = recipes
    .map((r) => {
      const m = recipeMetrics(r, items, prices, recipes, settings);
      const menuPrice = Number(r.menu_price || 0);
      const marginDollar = menuPrice ? menuPrice - m.ingCost : null;
      const marginPct = menuPrice ? (marginDollar / menuPrice) * 100 : null;
      return { r, m, marginDollar, marginPct };
    })
    .filter((x) => x.marginPct != null && !x.m.hasUnpriced);

  const bestMargin = [...withMargin].sort((a, b) => b.marginPct - a.marginPct).slice(0, 5);
  const worstMargin = [...withMargin].sort((a, b) => a.marginPct - b.marginPct).slice(0, 5);

  return (
    <div>
      <SectionHead title="Dashboard" desc="Where the whole bar's numbers land, at a glance." />
      <div className="bk-stat-grid">
        <StatCard
          label="Food cost %"
          value={fmtPct(foodCostPct)}
          sub={`Target ≤ ${goals.target_food_cost_pct}% · avg across ${foodRecipes.length} food recipe${foodRecipes.length === 1 ? "" : "s"}`}
          tone={healthClass(foodCostPct, goals.target_food_cost_pct)}
        />
        <StatCard
          label="Bar cost %"
          value={fmtPct(barCostPct)}
          sub={`Target ≤ ${goals.target_bar_cost_pct}% · avg across ${barRecipes.length} bar recipe${barRecipes.length === 1 ? "" : "s"}`}
          tone={healthClass(barCostPct, goals.target_bar_cost_pct)}
        />
        <StatCard
          label="Prime cost $"
          value={fmtMoney(primeCostTotal)}
          sub={recipesMissingTime ? `${recipesMissingTime} recipe${recipesMissingTime === 1 ? "" : "s"} missing labor time — add it for an accurate number` : "Ingredient cost + labor time × hourly rate, all recipes"}
          tone="stat-neutral"
        />
        <StatCard
          label="Prime cost % of sales"
          value={fmtPct(primeCostPctOfSales)}
          sub={`Target ≤ ${goals.target_prime_cost_pct}% · vs. total recipe menu value (proxy, not real sales)`}
          tone={healthClass(primeCostPctOfSales, goals.target_prime_cost_pct)}
        />
      </div>

      <div className="bk-two-col">
        <div className="bk-card">
          <div className="bk-card-head">
            <h4>Best margins</h4>
            <button className="bk-link" onClick={() => onGo("recipes")}>View all →</button>
          </div>
          {bestMargin.length === 0 ? (
            <EmptyState text="No priced, menu-priced recipes yet." sub="Set menu prices and price out ingredients to see margins." />
          ) : (
            <table className="bk-table">
              <thead>
                <tr><th>Recipe</th><th>Tag</th><th>Menu price</th><th>Margin $</th><th>Margin %</th></tr>
              </thead>
              <tbody>
                {bestMargin.map(({ r, marginDollar, marginPct }) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td><Pill tag={r.category_tag} /></td>
                    <td>{fmtMoney(r.menu_price)}</td>
                    <td className="stat-good">{fmtMoney(marginDollar)}</td>
                    <td className="stat-good">{fmtPct(marginPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bk-card">
          <div className="bk-card-head">
            <h4>Lowest margins</h4>
            <button className="bk-link" onClick={() => onGo("recipes")}>View all →</button>
          </div>
          {worstMargin.length === 0 ? (
            <EmptyState text="No priced, menu-priced recipes yet." sub="Set menu prices and price out ingredients to see margins." />
          ) : (
            <table className="bk-table">
              <thead>
                <tr><th>Recipe</th><th>Tag</th><th>Menu price</th><th>Margin $</th><th>Margin %</th></tr>
              </thead>
              <tbody>
                {worstMargin.map(({ r, marginDollar, marginPct }) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td><Pill tag={r.category_tag} /></td>
                    <td>{fmtMoney(r.menu_price)}</td>
                    <td className={marginDollar < 0 ? "stat-bad" : ""}>{fmtMoney(marginDollar)}</td>
                    <td className={marginDollar < 0 ? "stat-bad" : ""}>{fmtPct(marginPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <p className="bk-disclaimer">
        Margin here is menu price minus ingredient cost (labor share not included). Recipes with unpriced ingredients or no menu price are left out until they&apos;re fully costed.
      </p>

      <div className="bk-card">
        <div className="bk-card-head">
          <h4>Needs attention</h4>
          <button className="bk-link" onClick={() => onGo("inventory")}>Open inventory →</button>
        </div>
        {attention.stale.length === 0 && attention.expiring.length === 0 ? (
          <EmptyState text="Nothing needs a look right now." sub="Good boy, BarKeeper." />
        ) : (
          <ul className="bk-attention-list">
            {attention.expiring.map(({ item, exp }) => (
              <li key={"exp_" + item.id} className="bk-attn-orange">
                <strong>{item.name}</strong> expires {fmtDate(exp)} ({daysUntil(exp)}d)
              </li>
            ))}
            {attention.stale.map((item) => (
              <li key={"stale_" + item.id} className="bk-attn-gold">
                <strong>{item.name}</strong> hasn&apos;t had a price update in 90+ days
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bk-card">
        <div className="bk-card-head">
          <h4>Top 5 highest-cost recipes</h4>
          <button className="bk-link" onClick={() => onGo("recipes")}>View all →</button>
        </div>
        {topCost.length === 0 ? (
          <EmptyState text="No costed recipes yet." sub="Add ingredients to a recipe to see it here." />
        ) : (
          <table className="bk-table">
            <thead>
              <tr><th>Recipe</th><th>Tag</th><th>Ingredient cost</th><th>Food cost %</th></tr>
            </thead>
            <tbody>
              {topCost.map(({ r, m }) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td><Pill tag={r.category_tag} /></td>
                  <td>{fmtMoney(m.ingCost)}</td>
                  <td className={healthClass(m.foodCostPct, r.category_tag === "Food" ? goals.target_food_cost_pct : goals.target_bar_cost_pct)}>
                    {fmtPct(m.foodCostPct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
