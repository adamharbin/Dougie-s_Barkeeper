-- BarKeeper — Phase 1 schema
-- Real Supabase Auth (email/password) with two roles: admin, manager.
-- Labor cost is computed per recipe from labor_minutes x hourly rate — no
-- labor_entries / sales_entries tables (that period-labor model is retired
-- per Build Prompt v4).

-- ---------------------------------------------------------------------------
-- profiles (role lives here, one row per auth.users row)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text default '',
  role text not null default 'manager' check (role in ('admin', 'manager')),
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever someone signs up. The owner's email is
-- promoted to admin automatically; everyone else starts as a manager — bump
-- them to admin manually in the table editor if that ever changes.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when new.email = 'adam@pfourgroup.com' then 'admin' else 'manager' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Security-definer helper so RLS policies on other tables can check the
-- caller's role without re-triggering RLS on profiles itself.
create function public.current_role() returns text
language sql security definer stable set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_admin() returns boolean
language sql security definer stable set search_path = public
as $$
  select coalesce(public.current_role() = 'admin', false);
$$;

-- ---------------------------------------------------------------------------
-- core tables
-- ---------------------------------------------------------------------------

create table vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  contact_name text default '',
  contact_method text default '', -- phone/email/"order portal only"
  order_deadline text default '', -- day + time, free text
  delivery_days text default '',
  supplies_notes text default '', -- free text or tags matching inventory categories
  created_at timestamptz default now()
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  category_tag text not null default 'Food' check (category_tag in ('Food', 'Bar', 'Shared')),
  par_level numeric,
  shelf_life_days numeric, -- null = no expiry (e.g. well vodka)
  on_hand_qty numeric, -- most recent physical count; null = never counted
  recipe_unit text, -- fine-grained unit recipes reference (e.g. "oz")
  purchase_unit text default '', -- unit this item is normally bought in (e.g. "Case", "Bottle")
  pack_qty numeric default 1, -- # of inner containers per purchase unit (e.g. 6 bottles per case)
  inner_unit_label text, -- optional display label for the inner container (e.g. "bottle")
  size_per_inner numeric default 1, -- size of one inner container, in size_uom
  size_uom text, -- unit size_per_inner is measured in (usually = recipe_unit, not required to be)
  manual_factor numeric, -- fallback recipe_unit-per-size_uom factor when size_uom/recipe_unit don't auto-convert
  menu_category text, -- e.g. "On Draft", "Flatbreads", "Supplies" — see lib/costing.js MENU_CATEGORIES
  created_at timestamptz default now()
);

create table inventory_prices (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references inventory_items(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete set null,
  purchase_unit text, -- what was bought this entry (e.g. "Case") — defaults from the item, editable per entry
  qty_purchased numeric, -- # of purchase units bought (e.g. "2 cases")
  cost_per_purchase_unit numeric, -- invoice price for one purchase unit (e.g. $28.50/case)
  recipe_units_per_purchase_unit_snapshot numeric, -- conversion math LOCKED IN at log time — never recomputed later
  quantity numeric, -- = qty_purchased * snapshot; recipe units received. Drives weighted-avg cost, unchanged.
  cost numeric, -- = cost_per_purchase_unit / snapshot; cost PER RECIPE UNIT. Drives weighted-avg cost, unchanged.
  purchase_date date default current_date,
  checked_in_date date default current_date,
  source text default 'manual' check (source in ('manual', 'upload')),
  created_at timestamptz default now()
);

create table recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'New recipe',
  category_tag text not null default 'Food' check (category_tag in ('Food', 'Bar')),
  yield text, -- free text (e.g. "24 wings", "1 batch") not a strict count
  menu_price numeric,
  labor_minutes numeric, -- null/0 = "no time set", never estimated
  prep_notes text default '',
  menu_category text, -- e.g. "Flatbreads", "Salads" — see lib/costing.js MENU_CATEGORIES
  created_at timestamptz default now()
);

create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  item_id uuid references inventory_items(id),
  quantity numeric,
  unit text,
  created_at timestamptz default now()
);

-- One row per photo+instructions step in a recipe's build guide ("Prep
-- Method"). step_number is numeric (not serial) so two adjacent steps can be
-- reordered by swapping their step_number values without renumbering the
-- rest of the list. image_url points at the recipe-step-images Storage
-- bucket (public bucket — see storage policies below).
create table recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  step_number numeric not null,
  title text,
  instructions text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table goal_settings (
  id int primary key default 1,
  target_food_cost_pct numeric default 30,
  target_bar_cost_pct numeric default 22,
  target_prime_cost_pct numeric default 55,
  food_hourly_rate numeric default 15,
  bar_hourly_rate numeric default 15,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into goal_settings (id) values (1);

create table uploads (
  id uuid primary key default gen_random_uuid(),
  file_type text not null check (file_type in ('invoice', 'recipe')),
  original_filename text default '',
  parsed_status text default 'pending' check (parsed_status in ('pending', 'confirmed', 'discarded')),
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- A single dated physical-inventory-count event. total_value is the full
-- inventory valuation as of count_date: newly-counted items use this
-- session's quantity, uncounted items carry forward their existing
-- on_hand_qty — both priced at each item's weighted-avg cost at save time.
create table inventory_counts (
  id uuid primary key default gen_random_uuid(),
  count_date date default current_date,
  total_value numeric not null default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- One row per item actually counted in a session (partial counts are fine —
-- items not touched this session simply have no line here). unit_cost/
-- line_value are snapshotted at count time so this stays an honest audit
-- trail even if purchase history is edited later.
create table inventory_count_lines (
  id uuid primary key default gen_random_uuid(),
  count_id uuid references inventory_counts(id) on delete cascade,
  item_id uuid references inventory_items(id),
  quantity numeric not null,
  unit_cost numeric,
  line_value numeric,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- RLS — matches the permission matrix in Build Prompt v4 exactly
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table vendors enable row level security;
alter table inventory_items enable row level security;
alter table inventory_prices enable row level security;
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;
alter table recipe_steps enable row level security;
alter table goal_settings enable row level security;
alter table uploads enable row level security;
alter table inventory_counts enable row level security;
alter table inventory_count_lines enable row level security;

-- profiles: everyone can read their own row; admins can read/update everyone
-- (foundation for a future "manage users" screen — not built yet).
create policy "read own profile" on profiles for select using (auth.uid() = id or public.is_admin());
create policy "admin manage profiles" on profiles for update using (public.is_admin());

-- vendors: view = any signed-in user. Add/edit = admin + manager. Delete = admin only.
create policy "vendors select" on vendors for select using (auth.uid() is not null);
create policy "vendors insert" on vendors for insert with check (auth.uid() is not null);
create policy "vendors update" on vendors for update using (auth.uid() is not null);
create policy "vendors delete" on vendors for delete using (public.is_admin());

-- inventory_items: view = any signed-in user. Add/edit = admin + manager. Delete = admin only.
create policy "items select" on inventory_items for select using (auth.uid() is not null);
create policy "items insert" on inventory_items for insert with check (auth.uid() is not null);
create policy "items update" on inventory_items for update using (auth.uid() is not null);
create policy "items delete" on inventory_items for delete using (public.is_admin());

-- inventory_prices (purchase log / invoice lines): view = any signed-in user.
-- Add = admin + manager (matches "log a purchase" / "upload an invoice").
-- Edit/delete restricted to admin — correcting a logged purchase isn't in the
-- matrix, so default to the more conservative admin-only rather than letting
-- a manager silently rewrite cost history.
create policy "prices select" on inventory_prices for select using (auth.uid() is not null);
create policy "prices insert" on inventory_prices for insert with check (auth.uid() is not null);
create policy "prices update" on inventory_prices for update using (public.is_admin());
create policy "prices delete" on inventory_prices for delete using (public.is_admin());

-- recipes + recipe_ingredients: view = any signed-in user. All writes = admin only
-- (managers are read-only on recipes, matching the matrix).
create policy "recipes select" on recipes for select using (auth.uid() is not null);
create policy "recipes insert" on recipes for insert with check (public.is_admin());
create policy "recipes update" on recipes for update using (public.is_admin());
create policy "recipes delete" on recipes for delete using (public.is_admin());

create policy "recipe_ingredients select" on recipe_ingredients for select using (auth.uid() is not null);
create policy "recipe_ingredients insert" on recipe_ingredients for insert with check (public.is_admin());
create policy "recipe_ingredients update" on recipe_ingredients for update using (public.is_admin());
create policy "recipe_ingredients delete" on recipe_ingredients for delete using (public.is_admin());

-- recipe_steps (Prep Method build guide): view = any signed-in user.
-- All writes = admin only, same as recipes/recipe_ingredients.
create policy "recipe_steps select" on recipe_steps for select using (auth.uid() is not null);
create policy "recipe_steps insert" on recipe_steps for insert with check (public.is_admin());
create policy "recipe_steps update" on recipe_steps for update using (public.is_admin());
create policy "recipe_steps delete" on recipe_steps for delete using (public.is_admin());

-- goal_settings: view = any signed-in user. Edit = admin only.
create policy "goals select" on goal_settings for select using (auth.uid() is not null);
create policy "goals update" on goal_settings for update using (public.is_admin());

-- uploads: view + insert = any signed-in user (the target table's own RLS
-- already enforces who can actually save parsed rows — e.g. only an admin's
-- parsed recipe upload can insert into recipes).
create policy "uploads select" on uploads for select using (auth.uid() is not null);
create policy "uploads insert" on uploads for insert with check (auth.uid() is not null);

-- inventory_counts + lines: view + insert = any signed-in user (same level as
-- logging a purchase). No update/delete — a bad count gets corrected with a
-- new count, not a rewrite of history.
create policy "counts select" on inventory_counts for select using (auth.uid() is not null);
create policy "counts insert" on inventory_counts for insert with check (auth.uid() is not null);

create policy "count_lines select" on inventory_count_lines for select using (auth.uid() is not null);
create policy "count_lines insert" on inventory_count_lines for insert with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Storage — recipe step photos (public bucket: anyone with the URL can view
-- a photo, only admins can upload/replace/delete). Nothing sensitive lives
-- here, so a public bucket avoids signed-URL expiry/refresh complexity.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('recipe-step-images', 'recipe-step-images', true)
on conflict (id) do nothing;

create policy "recipe step images select" on storage.objects for select
  using (bucket_id = 'recipe-step-images');
create policy "recipe step images insert" on storage.objects for insert
  with check (bucket_id = 'recipe-step-images' and public.is_admin());
create policy "recipe step images update" on storage.objects for update
  using (bucket_id = 'recipe-step-images' and public.is_admin());
create policy "recipe step images delete" on storage.objects for delete
  using (bucket_id = 'recipe-step-images' and public.is_admin());
