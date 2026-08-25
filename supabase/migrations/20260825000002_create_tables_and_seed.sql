create table public.tables (
  id uuid primary key default gen_random_uuid(),
  nomor int not null unique,
  status text not null default 'empty' check (status in ('empty', 'occupied')),
  created_at timestamptz not null default now()
);

alter table public.tables enable row level security;

create policy "allow all on tables" on public.tables
  for all using (true) with check (true);

insert into public.tables (nomor)
select generate_series(1, 10);
