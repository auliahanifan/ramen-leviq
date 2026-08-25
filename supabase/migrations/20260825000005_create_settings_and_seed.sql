create table public.settings (
  id smallint primary key default 1 check (id = 1),
  password text not null default 'password',
  tax_percent numeric(5,2) not null default 0,
  service_charge_percent numeric(5,2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "allow all on settings" on public.settings
  for all using (true) with check (true);

insert into public.settings (id, password, tax_percent, service_charge_percent)
values (1, 'password', 0, 0);
