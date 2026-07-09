import { getSupabase } from "./supabaseClient";
import { DEFAULT_GOALS, DEFAULT_LABOR_RATES } from "./costing";

// ---- load everything, join client-side into the nested shapes the UI/calc logic expects ----
export async function loadAll() {
  const sb = getSupabase();
  const [itemsRes, pricesRes, vendorsRes, recipesRes, ingredientsRes, settingsRes] = await Promise.all([
    sb.from("inventory_items").select("*").order("created_at", { ascending: true }),
    sb.from("inventory_prices").select("*").order("created_at", { ascending: true }),
    sb.from("vendors").select("*").order("created_at", { ascending: true }),
    sb.from("recipes").select("*").order("created_at", { ascending: true }),
    sb.from("recipe_ingredients").select("*").order("created_at", { ascending: true }),
    sb.from("goal_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  for (const res of [itemsRes, pricesRes, vendorsRes, recipesRes, ingredientsRes, settingsRes]) {
    if (res.error) throw res.error;
  }

  const items = itemsRes.data || [];
  const prices = pricesRes.data || [];
  const vendors = vendorsRes.data || [];

  const recipes = (recipesRes.data || []).map((r) => ({
    ...r,
    ingredients: (ingredientsRes.data || [])
      .filter((ri) => ri.recipe_id === r.id)
      .map((ri) => ({ id: ri.id, item_id: ri.item_id, quantity: ri.quantity, unit: ri.unit })),
  }));

  const s = settingsRes.data;
  const settings = s
    ? {
        labor_rates: { food_hourly_rate: s.food_hourly_rate, bar_hourly_rate: s.bar_hourly_rate },
        goals: {
          target_food_cost_pct: s.target_food_cost_pct,
          target_bar_cost_pct: s.target_bar_cost_pct,
          target_prime_cost_pct: s.target_prime_cost_pct,
        },
      }
    : { labor_rates: DEFAULT_LABOR_RATES, goals: DEFAULT_GOALS };

  return { items, prices, vendors, recipes, settings };
}
