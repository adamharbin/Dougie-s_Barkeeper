export const DEFAULT_GOALS = { target_food_cost_pct: 30, target_bar_cost_pct: 22, target_prime_cost_pct: 55 };
export const DEFAULT_LABOR_RATES = { food_hourly_rate: 15, bar_hourly_rate: 15 };

export const fmtMoney = (n) => (n == null || isNaN(n) ? "—" : `$${Number(n).toFixed(2)}`);
export const fmtPct = (n) => (n == null || isNaN(n) ? "—" : `${Number(n).toFixed(1)}%`);
export const fmtDate = (d) => (!d ? "—" : new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
export const todayISO = () => new Date().toISOString().slice(0, 10);

// ---- weighted-average cost per unit across all logged purchases for an item ----
export function weightedAvgCost(itemId, prices) {
  const entries = prices.filter((p) => p.item_id === itemId);
  if (!entries.length) return null;
  const totalQty = entries.reduce((s, e) => s + Number(e.quantity || 0), 0);
  if (totalQty === 0) return null;
  const totalCost = entries.reduce((s, e) => s + Number(e.cost || 0) * Number(e.quantity || 0), 0);
  return totalCost / totalQty;
}

export function latestPriceEntry(itemId, prices) {
  const entries = prices.filter((p) => p.item_id === itemId);
  if (!entries.length) return null;
  return [...entries].sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))[0];
}

export function checkedInDate(itemId, prices) {
  const entries = prices.filter((p) => p.item_id === itemId && p.checked_in_date);
  if (!entries.length) return null;
  return [...entries].sort((a, b) => new Date(b.checked_in_date) - new Date(a.checked_in_date))[0].checked_in_date;
}

// Estimate only — never a food-safety guarantee. shelf_life_days == null means no expiry.
export function estimatedExpiration(item, prices) {
  const ci = checkedInDate(item.id, prices);
  if (!ci || item.shelf_life_days === "" || item.shelf_life_days == null) return null;
  const d = new Date(ci);
  d.setDate(d.getDate() + Number(item.shelf_life_days));
  return d.toISOString().slice(0, 10);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const ms = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export function isStalePrice(itemId, prices) {
  const latest = latestPriceEntry(itemId, prices);
  if (!latest) return true;
  const days = (Date.now() - new Date(latest.purchase_date).getTime()) / 86400000;
  return days >= 90;
}

export function recipeIngredientCost(recipe, items, prices) {
  let total = 0;
  let hasUnpriced = false;
  (recipe.ingredients || []).forEach((ing) => {
    const item = items.find((i) => i.id === ing.item_id);
    const cost = item ? weightedAvgCost(item.id, prices) : null;
    if (cost == null) hasUnpriced = true;
    else total += cost * Number(ing.quantity || 0);
  });
  return { total, hasUnpriced };
}

// labor_cost = (labor_minutes / 60) * hourly rate for the recipe's category.
// No labor_minutes set => treated as $0 labor, never estimated.
export function recipeLaborCost(recipe, settings) {
  const rates = settings.labor_rates || DEFAULT_LABOR_RATES;
  const rate = recipe.category_tag === "Food" ? Number(rates.food_hourly_rate || 0) : Number(rates.bar_hourly_rate || 0);
  const minutes = Number(recipe.labor_minutes || 0);
  return (minutes / 60) * rate;
}

export function recipeMetrics(recipe, items, prices, recipes, settings) {
  const { total: ingCost, hasUnpriced } = recipeIngredientCost(recipe, items, prices);
  const labor = recipeLaborCost(recipe, settings);
  const prime = ingCost + labor;
  const menuPrice = Number(recipe.menu_price || 0);
  const foodCostPct = menuPrice ? (ingCost / menuPrice) * 100 : null;
  const primeCostPct = menuPrice ? (prime / menuPrice) * 100 : null;
  return { ingCost, labor, prime, foodCostPct, primeCostPct, hasUnpriced };
}

export function healthClass(pct, target) {
  if (pct == null || target == null) return "stat-neutral";
  if (pct <= target) return "stat-good";
  if (pct <= target * 1.15) return "stat-warn";
  return "stat-bad";
}
