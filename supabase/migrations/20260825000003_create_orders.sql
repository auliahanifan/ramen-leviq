create table public.orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id),
  status text not null default 'open' check (status in ('open', 'paid', 'cancelled')),
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  service_charge numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_method text check (payment_method in ('cash', 'qris', 'card', 'transfer')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.orders enable row level security;

create policy "allow all on orders" on public.orders
  for all using (true) with check (true);
