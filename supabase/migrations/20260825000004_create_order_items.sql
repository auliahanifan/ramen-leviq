create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  menu_item_id uuid not null references public.menu_items(id),
  qty int not null check (qty > 0),
  price_at_order numeric(12,2) not null,
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

create policy "allow all on order_items" on public.order_items
  for all using (true) with check (true);
