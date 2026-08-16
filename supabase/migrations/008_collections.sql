-- Named shelves (collections) for the library

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint collections_name_len check (char_length(trim(name)) between 1 and 48)
);

create unique index collections_user_name_idx
  on public.collections (user_id, lower(trim(name)));

create table public.collection_items (
  collection_id uuid not null references public.collections (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, material_id)
);

create index collection_items_material_idx
  on public.collection_items (material_id);

alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

create policy "collections_select_own"
  on public.collections for select
  using (auth.uid() = user_id);

create policy "collections_insert_own"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy "collections_update_own"
  on public.collections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "collections_delete_own"
  on public.collections for delete
  using (auth.uid() = user_id);

create policy "collection_items_select_own"
  on public.collection_items for select
  using (auth.uid() = user_id);

create policy "collection_items_insert_own"
  on public.collection_items for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
    and exists (
      select 1 from public.materials m
      where m.id = material_id and m.user_id = auth.uid()
    )
  );

create policy "collection_items_delete_own"
  on public.collection_items for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on table public.collections to authenticated;
grant select, insert, delete on table public.collection_items to authenticated;
