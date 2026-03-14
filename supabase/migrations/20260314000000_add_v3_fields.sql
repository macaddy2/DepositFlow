-- Add V3 fields to tenancies
ALTER TABLE public.tenancies ADD COLUMN IF NOT EXISTS notice_date date;
ALTER TABLE public.tenancies ADD COLUMN IF NOT EXISTS landlord_name text;
ALTER TABLE public.tenancies ADD COLUMN IF NOT EXISTS agent_name text;
