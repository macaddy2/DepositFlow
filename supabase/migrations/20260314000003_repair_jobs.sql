CREATE TABLE IF NOT EXISTS public.repair_jobs (
  id uuid default uuid_generate_v4() primary key,
  tenancy_id uuid references public.tenancies(id) on delete cascade not null,
  assessment_item_id uuid references public.assessment_items(id),
  description text not null,
  fixed_price decimal(10, 2) not null,
  status text default 'quoted',
  scheduled_date date,
  completed_at timestamp with time zone,
  before_photo_url text,
  after_photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.repair_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own repair jobs" ON public.repair_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenancies
      WHERE id = repair_jobs.tenancy_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own repair jobs" ON public.repair_jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenancies
      WHERE id = repair_jobs.tenancy_id
      AND user_id = auth.uid()
    )
  );
