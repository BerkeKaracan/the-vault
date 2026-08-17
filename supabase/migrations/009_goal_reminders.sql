-- Opt-in OS reminders when a daily goal is set but not yet met.

alter table public.profiles
  add column if not exists goal_reminders boolean not null default false;

create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  locale text not null default 'tr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_select_own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "push_subscriptions_update_own"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on table public.push_subscriptions to authenticated;

create table public.goal_reminder_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null,
  slot text not null check (slot in ('12h', '3h')),
  sent_at timestamptz not null default now(),
  primary key (user_id, logged_on, slot)
);

alter table public.goal_reminder_log enable row level security;

grant select, insert on table public.goal_reminder_log to service_role;
revoke all on table public.goal_reminder_log from anon, authenticated;
