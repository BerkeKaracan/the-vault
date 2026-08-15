-- Allow correcting progress (negative pages_delta) and switching metric later.

alter table public.progress_entries
  drop constraint if exists progress_entries_pages_delta_check;

alter table public.progress_entries
  add constraint progress_entries_pages_delta_check
  check (pages_delta <> 0);

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
  v_after integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_page_after is null or p_logged_on is null then
    raise exception 'p_page_after and p_logged_on are required';
  end if;

  if p_page_after < 0 then
    raise exception 'page_after must be >= 0' using errcode = 'P0003';
  end if;

  select * into v_material
  from public.materials
  where id = p_material_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Material not found' using errcode = 'P0002';
  end if;

  v_after := p_page_after;
  if v_material.total_pages is not null and v_after > v_material.total_pages then
    v_after := v_material.total_pages;
  end if;

  v_delta := v_after - v_material.current_page;

  if v_delta = 0 then
    return v_material;
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
    v_after,
    p_logged_on
  );

  update public.materials
  set
    current_page = v_after,
    status = case
      when v_material.total_pages is not null
        and v_after >= v_material.total_pages
        then 'completed'::public.material_status
      when v_material.status = 'completed'
        then 'shelved'::public.material_status
      else v_material.status
    end,
    updated_at = now()
  where id = p_material_id
  returning * into v_material;

  return v_material;
end;
$$;
