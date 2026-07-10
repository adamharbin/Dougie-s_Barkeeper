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

const numOrNull = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

// ---- inventory_items ----
export async function insertItem(item) {
  const { data, error } = await getSupabase()
    .from("inventory_items")
    .insert({
      name: item.name,
      category_tag: item.category_tag,
      unit: item.unit || null,
      par_level: numOrNull(item.par_level),
      shelf_life_days: numOrNull(item.shelf_life_days),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(id, item) {
  const { error } = await getSupabase()
    .from("inventory_items")
    .update({
      name: item.name,
      category_tag: item.category_tag,
      unit: item.unit || null,
      par_level: numOrNull(item.par_level),
      shelf_life_days: numOrNull(item.shelf_life_days),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id) {
  const { error } = await getSupabase().from("inventory_items").delete().eq("id", id);
  if (error) throw error;
}

// ---- inventory_prices ----
export async function insertPrice(price) {
  const { error } = await getSupabase().from("inventory_prices").insert({
    item_id: price.item_id,
    vendor_id: price.vendor_id || null,
    quantity: numOrNull(price.quantity),
    unit: price.unit || null,
    cost: numOrNull(price.cost),
    purchase_date: price.purchase_date,
    checked_in_date: price.checked_in_date,
    source: price.source || "manual",
  });
  if (error) throw error;
}

export async function deletePrice(id) {
  const { error } = await getSupabase().from("inventory_prices").delete().eq("id", id);
  if (error) throw error;
}

// ---- vendors ----
export async function insertVendor(vendor) {
  const { error } = await getSupabase().from("vendors").insert({
    name: vendor.name,
    contact_name: vendor.contact_name || "",
    contact_method: vendor.contact_method || "",
    order_deadline: vendor.order_deadline || "",
    delivery_days: vendor.delivery_days || "",
    supplies_notes: vendor.supplies_notes || "",
  });
  if (error) throw error;
}

export async function updateVendor(id, vendor) {
  const { error } = await getSupabase()
    .from("vendors")
    .update({
      name: vendor.name,
      contact_name: vendor.contact_name || "",
      contact_method: vendor.contact_method || "",
      order_deadline: vendor.order_deadline || "",
      delivery_days: vendor.delivery_days || "",
      supplies_notes: vendor.supplies_notes || "",
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteVendor(id) {
  const { error } = await getSupabase().from("vendors").delete().eq("id", id);
  if (error) throw error;
}

// ---- recipes ----
export async function insertRecipe(recipe) {
  const { data, error } = await getSupabase()
    .from("recipes")
    .insert({
      name: recipe.name,
      category_tag: recipe.category_tag,
      yield: recipe.yield || null,
      menu_price: numOrNull(recipe.menu_price),
      labor_minutes: numOrNull(recipe.labor_minutes),
      prep_notes: recipe.prep_notes || "",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRecipe(id, recipe) {
  const { error } = await getSupabase()
    .from("recipes")
    .update({
      name: recipe.name,
      category_tag: recipe.category_tag,
      yield: recipe.yield || null,
      menu_price: numOrNull(recipe.menu_price),
      labor_minutes: numOrNull(recipe.labor_minutes),
      prep_notes: recipe.prep_notes || "",
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRecipe(id) {
  const { error } = await getSupabase().from("recipes").delete().eq("id", id);
  if (error) throw error;
}

// Full replace: simplest correct strategy for a form that submits the whole ingredient list at once.
export async function replaceRecipeIngredients(recipeId, ingredients) {
  const sb = getSupabase();
  const { error: delError } = await sb.from("recipe_ingredients").delete().eq("recipe_id", recipeId);
  if (delError) throw delError;
  if (!ingredients.length) return;
  const rows = ingredients.map((ing) => ({
    recipe_id: recipeId,
    item_id: ing.item_id,
    quantity: numOrNull(ing.quantity),
    unit: ing.unit || null,
  }));
  const { error: insError } = await sb.from("recipe_ingredients").insert(rows);
  if (insError) throw insError;
}
