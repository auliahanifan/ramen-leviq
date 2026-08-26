insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true)
on conflict (id) do nothing;

create policy "allow all on menu-photos" on storage.objects
  for all using (bucket_id = 'menu-photos') with check (bucket_id = 'menu-photos');
