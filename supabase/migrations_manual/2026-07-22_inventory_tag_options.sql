-- Add "Supplies" and "Packaging" as allowed inventory_items.category_tag
-- values (Tag dropdown in Inventory). Run in Supabase's SQL Editor.

alter table inventory_items drop constraint if exists inventory_items_category_tag_check;
alter table inventory_items add constraint inventory_items_category_tag_check
  check (category_tag in ('Food', 'Bar', 'Shared', 'Supplies', 'Packaging'));
