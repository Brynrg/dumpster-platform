create table if not exists public.notification_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  region text,
  product text,
  zip text,
  message text not null,
  dry_run boolean default false
);

create table if not exists public.lead_notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  lead_id uuid references public.leads(id) on delete cascade,
  campaign_id uuid references public.notification_campaigns(id) on delete cascade,
  sms_sid text,
  status text not null check (status in ('sent', 'skipped', 'failed')),
  error text,
  unique (lead_id, campaign_id)
);
