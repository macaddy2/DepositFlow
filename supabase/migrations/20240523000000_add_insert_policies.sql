-- Enable RLS on tables (if not already enabled)
alter table public.properties enable row level security;
alter table public.offers enable row level security;

-- P1 Fix: Allow authenticated users to insert properties
create policy "Authenticated users can insert properties"
  on public.properties for insert
  with check (auth.role() = 'authenticated');

-- P1 Fix: Allow authenticated users to insert offers (via server action)
create policy "Authenticated users can insert offers"
  on public.offers for insert
  with check (auth.role() = 'authenticated');

-- P1 Fix: Allow service role to do anything (for admin tasks / edge functions)
create policy "Service role full access on properties"
  on public.properties using (auth.role() = 'service_role');

create policy "Service role full access on offers"
  on public.offers using (auth.role() = 'service_role');
