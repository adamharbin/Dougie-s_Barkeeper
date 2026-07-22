-- Recipe Build Guide (Prep Method): recipe_steps table + storage bucket
-- Run this in Supabase's SQL Editor. Safe on an existing database — only
-- adds new objects, touches nothing else.

-- 1. Table
create table if not exists recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  step_number numeric not null,
  title text,
  instructions text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table recipe_steps enable row level security;

-- 2. RLS: view = any signed-in user. All writes = admin only (matches
-- recipes/recipe_ingredients).
create policy "recipe_steps select" on recipe_steps for select using (auth.uid() is not null);
create policy "recipe_steps insert" on recipe_steps for insert with check (public.is_admin());
create policy "recipe_steps update" on recipe_steps for update using (public.is_admin());
create policy "recipe_steps delete" on recipe_steps for delete using (public.is_admin());

-- 3. Storage bucket for step photos (public read, admin-only write).
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
