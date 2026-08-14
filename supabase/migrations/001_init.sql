-- The Vault — initial schema
-- Run in Supabase SQL Editor or via supabase db push

create type public.material_source as enum ('google', 'custom');
create type public.material_status as enum ('active', 'shelved', 'completed');

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  author text,
  total_pages integer check (total_pages is null or total_pages > 0),
  current_page integer not null default 0 check (current_page >= 0),
  cover_url text,
  google_books_id text,
  source public.material_source not null,
  status public.material_status not null default 'shelved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index materials_user_status_idx on public.materials (user_id, status);
create index materials_user_updated_idx on public.materials (user_id, updated_at desc);

create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete cascade,
  pages_delta integer not null check (pages_delta > 0),
  page_after integer not null check (page_after >= 0),
  logged_on date not null,
  created_at timestamptz not null default now()
);

create index progress_entries_user_logged_on_idx
  on public.progress_entries (user_id, logged_on);
create index progress_entries_material_idx
  on public.progress_entries (material_id);

alter table public.materials enable row level security;
alter table public.progress_entries enable row level security;

create policy "materials_select_own"
  on public.materials for select
  using (auth.uid() = user_id);

create policy "materials_insert_own"
  on public.materials for insert
  with check (auth.uid() = user_id);

create policy "materials_update_own"
  on public.materials for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "materials_delete_own"
  on public.materials for delete
  using (auth.uid() = user_id);

create policy "progress_select_own"
  on public.progress_entries for select
  using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.progress_entries for insert
  with check (auth.uid() = user_id);

-- No update/delete on progress_entries for clients (append-only via RPC)

-- Max 3 active materials per user (DB safety net; UX checks in Server Actions first)
create or replace function public.enforce_max_active_materials()
returns trigger
language plpgsql
as $$
declare
  active_count integer;
begin
  if new.status = 'active'
     and (tg_op = 'INSERT' or old.status is distinct from 'active') then
    select count(*)::integer into active_count
    from public.materials
    where user_id = new.user_id
      and status = 'active'
      and id is distinct from new.id;

    if active_count >= 3 then
      raise exception 'ACTIVE_DESK_FULL'
        using errcode = 'P0001',
              hint = 'Move a material to the Vault before activating another.';
    end if;
  end if;

  return new;
end;
$$;

create trigger materials_max_active
  before insert or update of status on public.materials
  for each row
  execute function public.enforce_max_active_materials();

-- Atomic progress log + current_page update (and auto-complete when total_pages known)
create or replace function public.log_progress(
  p_material_id uuid,
  p_page_after integer,
  p_logged_on date
)
returns public.materials
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_material public.materials;
  v_delta integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_page_after is null or p_logged_on is null then
    raise exception 'p_page_after and p_logged_on are required';
  end if;

  select * into v_material
  from public.materials
  where id = p_material_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Material not found' using errcode = 'P0002';
  end if;

  v_delta := p_page_after - v_material.current_page;

  if v_delta <= 0 then
    raise exception 'page_after must be greater than current_page'
      using errcode = 'P0003';
  end if;

  insert into public.progress_entries (
    user_id,
    material_id,
    pages_delta,
    page_after,
    logged_on
  ) values (
    auth.uid(),
    p_material_id,
    v_delta,
    p_page_after,
    p_logged_on
  );

  update public.materials
  set
    current_page = p_page_after,
    status = case
      when total_pages is not null and p_page_after >= total_pages
        then 'completed'::public.material_status
      else status
    end,
    updated_at = now()
  where id = p_material_id
  returning * into v_material;

  return v_material;
end;
$$;

grant execute on function public.log_progress(uuid, integer, date) to authenticated;
