create table if not exists public.pricing_configs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  region text not null unique,
  fuel_price numeric,
  avg_mpg numeric,
  avg_distance_miles numeric,
  labor_cost numeric,
  overhead_per_day numeric,
  dump_margin_percent numeric,
  trailer_payment numeric,
  trailer_term_months integer,
  maintenance_per_month numeric,
  target_utilization numeric,
  notes text
);
