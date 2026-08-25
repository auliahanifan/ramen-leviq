create table public.prompts (
  id text primary key,
  content text not null,
  prompted_at timestamptz not null,
  session_id text not null,
  created_at timestamptz not null default now()
);

create index prompts_prompted_at_idx on public.prompts (prompted_at);

alter table public.prompts enable row level security;

create policy "allow all on prompts" on public.prompts
  for all using (true) with check (true);
