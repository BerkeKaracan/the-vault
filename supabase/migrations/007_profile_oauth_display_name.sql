-- Copy OAuth display name into profiles on signup.
-- Keys: raw_user_meta_data full_name / name / user_name / preferred_username, then email prefix.
-- Safe to re-run: replaces handle_new_user only; does not drop user data.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  display text;
begin
  display := coalesce(
    nullif(trim(meta->>'full_name'), ''),
    nullif(trim(meta->>'name'), ''),
    nullif(trim(meta->>'user_name'), ''),
    nullif(trim(meta->>'preferred_username'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), '')
  );

  if display is not null then
    display := left(display, 80);
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, display);
  return new;
end;
$$;
