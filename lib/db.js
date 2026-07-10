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

// ---- goal_settings (single row, id=1) ----
export async function updateGoalSettings(patch) {
  const row = {};
  if ("food_hourly_rate" in patch) row.food_hourly_rate = numOrNull(patch.food_hourly_rate);
  if ("bar_hourly_rate" in patch) row.bar_hourly_rate = numOrNull(patch.bar_hourly_rate);
  if ("target_food_cost_pct" in patch) row.target_food_cost_pct = numOrNull(patch.target_food_cost_pct);
  if ("target_bar_cost_pct" in patch) row.target_bar_cost_pct = numOrNull(patch.target_bar_cost_pct);
  if ("target_prime_cost_pct" in patch) row.target_prime_cost_pct = numOrNull(patch.target_prime_cost_pct);
  const { error } = await getSupabase().from("goal_settings").update(row).eq("id", 1);
  if (error) throw error;
}

// ---- inventory_items ----
export async function insertItem(item) {
  const { data, error } = await getSupabase()
    .from("inventory_items")
    .insert({
      name: item.name,
      category_tag: item.category_tag,
      par_level: numOrNull(item.par_level),
      shelf_life_days: numOrNull(item.shelf_life_days),
      recipe_unit: item.recipe_unit || null,
      purchase_unit: item.purchase_unit || null,
      pack_qty: numOrNull(item.pack_qty) ?? 1,
      inner_unit_label: item.inner_unit_label || null,
      size_per_inner: numOrNull(item.size_per_inner) ?? 1,
      size_uom: item.size_uom || null,
      manual_factor: numOrNull(item.manual_factor),
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
      par_level: numOrNull(item.par_level),
      shelf_life_days: numOrNull(item.shelf_life_days),
      recipe_unit: item.recipe_unit || null,
      purchase_unit: item.purchase_unit || null,
      pack_qty: numOrNull(item.pack_qty) ?? 1,
      inner_unit_label: item.inner_unit_label || null,
      size_per_inner: numOrNull(item.size_per_inner) ?? 1,
      size_uom: item.size_uom || null,
      manual_factor: numOrNull(item.manual_factor),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id) {
  const { error } = await getSupabase().from("inventory_items").delete().eq("id", id);
  if (error) throw error;
}

// ---- inventory_prices ----
// Both insert and update expect `recipe_units_per_purchase_unit_snapshot` to
// already be resolved by the caller: for a NEW entry, from the item's current
// unit setup (lib/costing.js recipeUnitsPerPurchaseUnit); for an EDIT, carried
// forward unchanged from the entry being edited. This file never recomputes
// it from the item — that's what keeps historical cost from drifting if the
// item's pack size changes later.
function derivePriceRow(price) {
  const snapshot = numOrNull(price.recipe_units_per_purchase_unit_snapshot);
  const qtyPurchased = numOrNull(price.qty_purchased) || 0;
  const costPerPurchaseUnit = numOrNull(price.cost_per_purchase_unit) || 0;
  return {
    vendor_id: price.vendor_id || null,
    purchase_unit: price.purchase_unit || null,
    qty_purchased: qtyPurchased,
    cost_per_purchase_unit: costPerPurchaseUnit,
    recipe_units_per_purchase_unit_snapshot: snapshot,
    quantity: snapshot ? qtyPurchased * snapshot : null,
    cost: snapshot ? costPerPurchaseUnit / snapshot : null,
    purchase_date: price.purchase_date,
    checked_in_date: price.checked_in_date,
  };
}

export async function insertPrice(price) {
  const { error } = await getSupabase().from("inventory_prices").insert({
    item_id: price.item_id,
    ...derivePriceRow(price),
    source: price.source || "manual",
  });
  if (error) throw error;
}

export async function updatePrice(id, price) {
  const { error } = await getSupabase().from("inventory_prices").update(derivePriceRow(price)).eq("id", id);
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

// ---- inventory counts ----
// lines: [{ item_id, quantity, unit_cost, line_value }] for items actually counted
// this session (partial counts are fine — untouched items just have no line).
export async function saveInventoryCount({ countDate, totalValue, lines }) {
  const sb = getSupabase();
  const { data: count, error: countError } = await sb
    .from("inventory_counts")
    .insert({ count_date: countDate, total_value: totalValue })
    .select()
    .single();
  if (countError) throw countError;

  if (lines.length) {
    const rows = lines.map((l) => ({
      count_id: count.id,
      item_id: l.item_id,
      quantity: l.quantity,
      unit_cost: l.unit_cost,
      line_value: l.line_value,
    }));
    const { error: linesError } = await sb.from("inventory_count_lines").insert(rows);
    if (linesError) throw linesError;

    for (const l of lines) {
      const { error: updError } = await sb.from("inventory_items").update({ on_hand_qty: l.quantity }).eq("id", l.item_id);
      if (updError) throw updError;
    }
  }

  return count;
}

export async function loadInventoryCounts() {
  const { data, error } = await getSupabase()
    .from("inventory_counts")
    .select("*")
    .order("count_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
