-- Invoice Library: a document archive (upload a PDF/photo, tag with
-- vendor/date/total/notes, browse and download later). Private storage
-- bucket -- every view goes through a fresh signed URL, never a public
-- link, since invoices can carry real pricing/business info. Run in
-- Supabase's SQL Editor.

-- 1. Table
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id) on delete set null,
  invoice_date date default current_date,
  total_amount numeric,
  notes text default '',
  file_path text not null,
  file_name text default '',
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table invoices enable row level security;

-- 2. RLS: view + upload = any signed-in user. Edit/delete = admin only.
create policy "invoices select" on invoices for select using (auth.uid() is not null);
create policy "invoices insert" on invoices for insert with check (auth.uid() is not null);
create policy "invoices update" on invoices for update using (public.is_admin());
create policy "invoices delete" on invoices for delete using (public.is_admin());

-- 3. Private storage bucket + policies.
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "invoice files select" on storage.objects for select
  using (bucket_id = 'invoices' and auth.uid() is not null);
create policy "invoice files insert" on storage.objects for insert
  with check (bucket_id = 'invoices' and auth.uid() is not null);
create policy "invoice files update" on storage.objects for update
  using (bucket_id = 'invoices' and public.is_admin());
create policy "invoice files delete" on storage.objects for delete
  using (bucket_id = 'invoices' and public.is_admin());
