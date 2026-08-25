create unique index orders_one_open_per_table
  on public.orders (table_id)
  where status = 'open';
