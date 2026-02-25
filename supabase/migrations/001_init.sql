create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  region text not null,
  product text not null,
  address1 text,
  city text,
  state text,
  zip text,
  requested_date date,
  duration text,
  urgency text,
  material_type text,
  notes text,
  name text,
  phone text not null,
  email text,
  sms_opt_in boolean not null,
  notified boolean default false
);

create table if not exists public.disposal_facilities (
  id uuid primary key default gen_random_uuid(),
  market text not null,
  name text not null,
  facility_type text,
  address1 text,
  city text,
  state text,
  zip text,
  phone text,
  website text,
  commercial_allowed boolean,
  notes text,
  last_verified date
);

create table if not exists public.disposal_rates (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.disposal_facilities(id) on delete cascade,
  material_category text,
  price numeric,
  unit text,
  effective_date date,
  source_url text,
  source_notes text
);
