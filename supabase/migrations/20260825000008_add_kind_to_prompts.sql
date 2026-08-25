alter table public.prompts
  add column kind text not null default 'prompt' check (kind in ('prompt','answer'));
