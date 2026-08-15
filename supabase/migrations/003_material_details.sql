-- Book discovery fields on materials

alter table public.materials
  add column description text,
  add column published_date text,
  add column publisher text,
  add column categories text[];

create unique index materials_user_google_books_id_uidx
  on public.materials (user_id, google_books_id)
  where google_books_id is not null;
