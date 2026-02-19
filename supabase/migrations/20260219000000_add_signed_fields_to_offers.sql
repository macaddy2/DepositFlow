-- Add signed_at and signature_data columns to offers table
-- This replaces the need for a separate contracts table

ALTER TABLE public.offers
    ADD COLUMN IF NOT EXISTS signed_at timestamptz,
    ADD COLUMN IF NOT EXISTS signature_data text;
