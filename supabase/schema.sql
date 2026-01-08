-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  phone text,
  email text,
  bank_sort_code text,
  bank_account_number text,
  kyc_status text default 'pending',
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Properties
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  address_line_1 text not null,
  city text not null,
  postcode text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.properties enable row level security;
create policy "Properties are viewable by authenticated users" on public.properties for select using (auth.role() = 'authenticated');

-- Tenancies
create table public.tenancies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id),
  landlord_name text,
  agent_name text,
  deposit_amount decimal(10, 2) not null,
  tds_scheme text not null, -- 'DPS', 'TDS', 'MyDeposits'
  tds_reference text not null,
  tenancy_start_date date,
  tenancy_end_date date not null,
  -- Property condition flags
  cleaning_needed boolean default false,
  painting_needed boolean default false,
  holes_needed boolean default false,
  flooring_needed boolean default false,
  status text default 'pending_audit', -- pending_audit, audit_submitted, offer_generated, contract_signed, in_progress, completed, disputed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.tenancies enable row level security;
create policy "Users can view own tenancies" on public.tenancies for select using (auth.uid() = user_id);
create policy "Users can insert own tenancies" on public.tenancies for insert with check (auth.uid() = user_id);

-- Audits
create table public.audits (
  id uuid default uuid_generate_v4() primary key,
  tenancy_id uuid references public.tenancies(id) on delete cascade not null,
  video_url text,
  notes text,
  ai_risk_score decimal(3, 2),
  admin_reviewed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.audits enable row level security;
create policy "Users can view own audits" on public.audits for select using ( exists ( select 1 from public.tenancies where id = audits.tenancy_id and user_id = auth.uid() ) );
create policy "Users can insert own audits" on public.audits for insert with check ( exists ( select 1 from public.tenancies where id = tenancy_id and user_id = auth.uid() ) );

-- Audit Photos
create table public.audit_photos (
  id uuid default uuid_generate_v4() primary key,
  audit_id uuid references public.audits(id) on delete cascade not null,
  photo_url text not null,
  room_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.audit_photos enable row level security;
create policy "Users can view own audit photos" on public.audit_photos for select using ( exists ( select 1 from public.audits join public.tenancies on audits.tenancy_id = tenancies.id where audits.id = audit_photos.audit_id and tenancies.user_id = auth.uid() ) );

-- Offers
create table public.offers (
  id uuid default uuid_generate_v4() primary key,
  tenancy_id uuid references public.tenancies(id) on delete cascade not null,
  estimated_repair_cost decimal(10, 2),
  service_fee decimal(10, 2),
  advance_amount decimal(10, 2) not null,
  status text default 'pending', -- pending, accepted, rejected, expired
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.offers enable row level security;
create policy "Users can view own offers" on public.offers for select using ( exists ( select 1 from public.tenancies where id = offers.tenancy_id and user_id = auth.uid() ) );

-- Deed of Assignments (for transferring deposit rights)
create table public.deed_of_assignments (
  id uuid default uuid_generate_v4() primary key,
  offer_id uuid references public.offers(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  assignee_name text default 'DepositFlow Ltd' not null,
  deposit_amount decimal(10, 2) not null,
  advance_amount decimal(10, 2) not null,
  tds_scheme text not null,
  tds_reference text not null,
  property_address text not null,
  tenant_signature text, -- Base64 encoded signature
  tenant_signed_at timestamp with time zone,
  witness_name text,
  witness_signature text,
  witness_signed_at timestamp with time zone,
  status text default 'pending', -- pending, tenant_signed, fully_executed, voided
  document_url text, -- URL to final PDF
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.deed_of_assignments enable row level security;
create policy "Users can view own deeds" on public.deed_of_assignments for select using (auth.uid() = tenant_id);
create policy "Users can insert own deeds" on public.deed_of_assignments for insert with check (auth.uid() = tenant_id);
create policy "Users can update own deeds" on public.deed_of_assignments for update using (auth.uid() = tenant_id);

-- Contracts (legacy, kept for compatibility)
create table public.contracts (
  id uuid default uuid_generate_v4() primary key,
  offer_id uuid references public.offers(id) on delete cascade not null,
  deed_id uuid references public.deed_of_assignments(id),
  hellosign_signature_request_id text,
  signed_document_url text,
  status text default 'pending_signature', -- pending_signature, signed, voided
  signed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.contracts enable row level security;
create policy "Users can view own contracts" on public.contracts for select using ( exists ( select 1 from public.offers join public.tenancies on offers.tenancy_id = tenancies.id where offers.id = contracts.offer_id and tenancies.user_id = auth.uid() ) );

-- Storage
insert into storage.buckets (id, name, public) values ('videos', 'videos', false) on conflict (id) do nothing;

create policy "Users can upload their own audit videos"
on storage.objects for insert
with check ( bucket_id = 'videos' and auth.uid() = owner );

create policy "Users can view their own audit videos"
on storage.objects for select
using ( bucket_id = 'videos' and auth.uid() = owner );

