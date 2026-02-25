create table if not exists public.seo_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  market text not null check (market in ('tx-spring', 'tx-north-houston', 'fl-brevard')),
  category text not null check (category in ('gbp', 'reviews', 'citations', 'content', 'maps')),
  title text not null,
  cadence text check (cadence in ('weekly', 'monthly', 'quarterly', 'one_time')),
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done', 'skipped')),
  notes text
);

create table if not exists public.review_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  market text not null check (market in ('tx-spring', 'tx-north-houston', 'fl-brevard')),
  lead_id uuid references public.leads(id) on delete set null,
  contact_name text,
  phone text,
  email text,
  channel text check (channel in ('sms', 'email')),
  message text,
  status text default 'draft' check (status in ('draft', 'sent', 'completed', 'failed')),
  completed_at timestamptz,
  notes text
);

create table if not exists public.citations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  market text not null check (market in ('tx-spring', 'tx-north-houston', 'fl-brevard')),
  provider text not null,
  listing_url text,
  nap_name text,
  nap_phone text,
  nap_service_area text,
  status text default 'todo' check (status in ('todo', 'submitted', 'live', 'needs_fix')),
  last_verified date,
  notes text,
  unique (market, provider)
);
