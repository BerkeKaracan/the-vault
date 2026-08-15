-- Color scheme (dark | light)

create type public.color_scheme as enum ('dark', 'light');

alter table public.profiles
  add column color_scheme public.color_scheme not null default 'dark';
