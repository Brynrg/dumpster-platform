create or replace function get_lead_counts_by_region(region_ids text[])
returns table (region text, count bigint)
language sql
as $$
  select l.region, count(l.id)
  from leads l
  where l.region = any(region_ids)
  group by l.region;
$$;

create or replace function get_lead_counts_by_product(product_ids text[])
returns table (product text, count bigint)
language sql
as $$
  select l.product, count(l.id)
  from leads l
  where l.product = any(product_ids)
  group by l.product;
$$;
