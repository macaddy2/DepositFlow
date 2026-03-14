CREATE TABLE IF NOT EXISTS public.assessment_items (
  id uuid default uuid_generate_v4() primary key,
  audit_id uuid references public.audits(id) on delete cascade not null,
  room_type text not null,
  item_name text not null,
  risk_level text not null default 'green',
  description text,
  estimated_deduction decimal(10, 2),
  recommended_action text,
  repair_quote decimal(10, 2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.assessment_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assessment items" ON public.assessment_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.audits
      JOIN public.tenancies ON audits.tenancy_id = tenancies.id
      WHERE audits.id = assessment_items.audit_id
      AND tenancies.user_id = auth.uid()
    )
  );
