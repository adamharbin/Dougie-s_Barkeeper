-- Inventory item archiving + deleting items that are used in recipes or
-- were ever counted. Run in Supabase's SQL Editor.

-- 1. Archive flag (null = active).
alter table inventory_items add column if not exists archived_at timestamptz;

-- 2. Deleting an item removes it from any recipes that use it.
alter table recipe_ingredients drop constraint if exists recipe_ingredients_item_id_fkey;
alter table recipe_ingredients
  add constraint recipe_ingredients_item_id_fkey
  foreign key (item_id) references inventory_items(id) on delete cascade;

-- 3. Past count history keeps its snapshotted cost/value; the line just
--    loses its item link instead of blocking the delete.
alter table inventory_count_lines drop constraint if exists inventory_count_lines_item_id_fkey;
alter table inventory_count_lines
  add constraint inventory_count_lines_item_id_fkey
  foreign key (item_id) references inventory_items(id) on delete set null;
