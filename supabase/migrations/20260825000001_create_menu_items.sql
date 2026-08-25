create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  harga numeric(12,2) not null check (harga >= 0),
  kategori text not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.menu_items enable row level security;

create policy "allow all on menu_items" on public.menu_items
  for all using (true) with check (true);
