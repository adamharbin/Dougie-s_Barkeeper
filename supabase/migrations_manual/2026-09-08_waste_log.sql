-- Waste Log: track wasted inventory (spoilage, over-prep, breakage, comps,
-- etc.) with date, item, category, reason, and quantity. Quantity is
-- expressed in the item's own recipe_unit; cost is priced live off the
-- item's current weighted-avg cost rather than snapshotted here. Run in
-- Supabase's SQL Editor.

create table if not exists waste_log (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references inventory_items(id) on delete set null,
  waste_date date default current_date,
  category text default 'Other' check (category in ('Spoilage/Expired', 'Over-prep', 'Breakage/Spill', 'Comp/Mistake', 'Other')),
  reason text default '',
  quantity numeric not null,
  logged_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table waste_log enable row level security;

create policy "waste_log select" on waste_log for select using (auth.uid() is not null);
create policy "waste_log insert" on waste_log for insert with check (auth.uid() is not null);
create policy "waste_log update" on waste_log for update using (public.is_admin());
create policy "waste_log delete" on waste_log for delete using (public.is_admin());
