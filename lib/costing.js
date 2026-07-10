export const DEFAULT_GOALS = { target_food_cost_pct: 30, target_bar_cost_pct: 22, target_prime_cost_pct: 55 };
export const DEFAULT_LABOR_RATES = { food_hourly_rate: 15, bar_hourly_rate: 15 };

// Matches the actual menu's section headers, plus a non-menu "Supplies"
// catch-all for cleaning/disposables/etc. that never appear on the menu.
export const MENU_CATEGORIES = [
  "On Draft",
  "Domestic & Import Cans",
  "Hard Tea & Lemonade",
  "Seltzers",
  "Canned Cocktails",
  "Wine",
  "Frozen",
  "Zero Proof & THC/CBD",
  "Cravings",
  "Salads",
  "From The Oven",
  "Flatbreads",
  "For Kids",
  "Handhelds",
  "Sweets",
  "Beverages",
  "Dog Menu",
  "Supplies",
];

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

// ---- unit conversion (weight / volume / count) ----
// toBase = how many of the group's base unit (oz for weight, floz for volume)
// equal 1 of this unit. Only units within the same group convert automatically.
export const UNIT_CONVERSIONS = {
  oz: { group: "weight", toBase: 1 },
  lb: { group: "weight", toBase: 16 },
  g: { group: "weight", toBase: 0.035274 },
  kg: { group: "weight", toBase: 35.274 },
  floz: { group: "volume", toBase: 1 },
  ml: { group: "volume", toBase: 0.033814 },
  l: { group: "volume", toBase: 33.814 },
  gal: { group: "volume", toBase: 128 },
  qt: { group: "volume", toBase: 32 },
  pt: { group: "volume", toBase: 16 },
  cup: { group: "volume", toBase: 8 },
  tbsp: { group: "volume", toBase: 0.5 },
  tsp: { group: "volume", toBase: 0.166667 },
  each: { group: "count", toBase: 1 },
  ea: { group: "count", toBase: 1 },
};

// Multiplier to turn 1 `fromUnit` into `toUnit`s, or null if there's no
// built-in path (unknown unit, or different groups — e.g. lb -> floz).
export function unitConversionFactor(fromUnit, toUnit) {
  if (!fromUnit || !toUnit) return null;
  if (fromUnit.toLowerCase() === toUnit.toLowerCase()) return 1;
  const from = UNIT_CONVERSIONS[fromUnit.toLowerCase()];
  const to = UNIT_CONVERSIONS[toUnit.toLowerCase()];
  if (!from || !to || from.group !== to.group) return null;
  return from.toBase / to.toBase;
}

// How many recipe_units are in one purchase_unit, e.g. a case of 6 x 114oz
// bottles costed in oz = 6 x 114 x 1 = 684. Returns null when size_uom and
// recipe_unit can't be auto-converted and no manual_factor has been set —
// callers should treat that as "needs setup", never guess.
export function recipeUnitsPerPurchaseUnit(item) {
  const packQty = Number(item.pack_qty || 1);
  const sizePerInner = Number(item.size_per_inner || 1);
  const auto = unitConversionFactor(item.size_uom, item.recipe_unit);
  const factor = auto != null ? auto : item.manual_factor != null && item.manual_factor !== "" ? Number(item.manual_factor) : null;
  if (factor == null) return null;
  return packQty * sizePerInner * factor;
}

// Human-readable purchase-unit label, e.g. "Case (6 x 114oz bottles)".
export function formatPurchaseUnitLabel(item) {
  const label = item.purchase_unit || "—";
  const pack = Number(item.pack_qty || 1);
  if (pack <= 1 || !item.size_per_inner) return label;
  const innerWord = item.inner_unit_label ? ` ${item.inner_unit_label}${pack === 1 ? "" : "s"}` : "";
  return `${label} (${pack} × ${item.size_per_inner}${item.size_uom || ""}${innerWord})`;
}

// Cost per the fine-grained unit a recipe actually uses (oz, tbsp, each…).
// The purchase->recipe-unit conversion already happened when the purchase was
// logged (quantity/cost are stored in recipe-unit terms), so this is simply
// the weighted average — kept as its own name since callers (recipe costing,
// the Inventory table) conceptually want "cost per recipe unit."
export function costPerRecipeUnit(item, prices) {
  return weightedAvgCost(item.id, prices);
}

// null = can't value it yet (never counted, or no cost history) — never silently $0.
export function onHandValue(item, prices) {
  if (item.on_hand_qty == null) return null;
  const cost = weightedAvgCost(item.id, prices);
  if (cost == null) return null;
  return item.on_hand_qty * cost;
}

// Whole-inventory valuation, with optional draft overrides for items being
// actively (re)counted right now (item_id -> new qty, or null to clear).
// Shared by the full count modal and any single-item inline count edit, so
// "what's the total inventory worth as of this count" is computed one way.
export function computeInventoryValuation(items, prices, overrides = {}) {
  const rows = items.map((item) => {
    const cost = weightedAvgCost(item.id, prices);
    const touched = Object.prototype.hasOwnProperty.call(overrides, item.id);
    const qty = touched ? overrides[item.id] : item.on_hand_qty;
    const value = qty != null && cost != null ? qty * cost : null;
    return { item, cost, qty, value, touched };
  });
  const totalValue = rows.reduce((s, r) => s + (r.value || 0), 0);
  return { rows, totalValue };
}

export function recipeIngredientCost(recipe, items, prices) {
  let total = 0;
  let hasUnpriced = false;
  (recipe.ingredients || []).forEach((ing) => {
    const item = items.find((i) => i.id === ing.item_id);
    const cost = item ? costPerRecipeUnit(item, prices) : null;
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
