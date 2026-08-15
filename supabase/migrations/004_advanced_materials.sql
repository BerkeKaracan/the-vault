-- Preferences, metric types, tags, sessions, notes

create type public.accent_color as enum ('emerald', 'blue', 'amber');
create type public.metric_type as enum ('pages', 'questions', 'chapters');

alter table public.profiles
  add column accent_color public.accent_color not null default 'emerald',
  add column daily_goal integer check (daily_goal is null or daily_goal > 0),
  add column focus_mode boolean not null default false;

alter table public.materials
  add column metric_type public.metric_type not null default 'pages',
  add column tags text[] not null default '{}';

create index materials_tags_gin on public.materials using gin (tags);

create table public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds > 0),
  units_delta integer check (units_delta is null or units_delta > 0),
  created_at timestamptz not null default now()
);

create index reading_sessions_material_idx
  on public.reading_sessions (material_id, ended_at desc);
create index reading_sessions_user_idx
  on public.reading_sessions (user_id, ended_at desc);

alter table public.reading_sessions enable row level security;

create policy "sessions_select_own"
  on public.reading_sessions for select
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.reading_sessions for insert
  with check (auth.uid() = user_id);

grant select, insert on table public.reading_sessions to authenticated;

create table public.material_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, material_id)
);

create index material_notes_material_idx on public.material_notes (material_id);

alter table public.material_notes enable row level security;

create policy "notes_select_own"
  on public.material_notes for select
  using (auth.uid() = user_id);

create policy "notes_insert_own"
  on public.material_notes for insert
  with check (auth.uid() = user_id);

create policy "notes_update_own"
  on public.material_notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on table public.material_notes to authenticated;
